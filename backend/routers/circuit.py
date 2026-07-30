"""Circuit execution router."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["circuit"])

# In-memory job store (replace with a persistent store for production)
_jobs: dict[str, dict[str, object]] = {}


class RunRequest(BaseModel):
    code: str
    backend: str = "aer_simulator"


class RunResponse(BaseModel):
    job_id: str
    status: str


class ResultResponse(BaseModel):
    job_id: str
    status: str
    counts: dict[str, int] | None = None
    statevector: list[complex] | None = None


@router.post("/run", response_model=RunResponse)
async def run_circuit(req: RunRequest) -> RunResponse:
    """Execute a Qiskit circuit and return a job ID."""
    job_id = str(uuid.uuid4())

    # Run the circuit in-process using Aer simulator
    try:
        local_ns: dict[str, object] = {}
        exec(req.code, {"__builtins__": __builtins__}, local_ns)  # noqa: S102

        from qiskit_aer import AerSimulator  # type: ignore[import]

        simulator = AerSimulator()
        qc = local_ns.get("qc")
        if qc is None:
            raise ValueError("Circuit code must assign a QuantumCircuit to 'qc'")

        from qiskit import transpile  # type: ignore[import]

        compiled = transpile(qc, simulator)
        job = simulator.run(compiled, shots=1024)
        result = job.result()
        counts = dict(result.get_counts())
        _jobs[job_id] = {"status": "done", "counts": counts}
    except Exception as exc:  # noqa: BLE001
        _jobs[job_id] = {"status": "error", "error": str(exc)}
        return RunResponse(job_id=job_id, status="error")

    return RunResponse(job_id=job_id, status="done")


@router.get("/result/{job_id}", response_model=ResultResponse)
async def get_result(job_id: str) -> ResultResponse:
    """Retrieve circuit execution results."""
    job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    counts = job.get("counts")  # type: ignore[assignment]
    return ResultResponse(
        job_id=job_id,
        status=str(job["status"]),
        counts=counts,  # type: ignore[arg-type]
    )

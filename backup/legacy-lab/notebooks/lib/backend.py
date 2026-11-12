"""
notebooks/lib/backend.py
Circuit execution helpers (run locally in Jupyter — no server involved).

- run_via_backend / list_backends: execute a Qiskit circuit in-process on the
  local Aer simulator, or on a real IBM Quantum backend if ``IBMQ_API_TOKEN``
  is set.
- explain_with_bob: still an HTTP client — it calls the bob4q MCP server's
  ``explain_circuit`` tool, a separate long-lived process (unlike circuit
  execution, which doesn't need one).
"""

from __future__ import annotations

import os

import httpx


def run_via_backend(
    code: str,
    backend: str = "aer_simulator",
    timeout: float = 30.0,
) -> dict[str, int] | None:
    """Execute circuit *code* (must assign a ``QuantumCircuit`` to ``qc``) on *backend*.

    Args:
        code: Python source that assigns a ``QuantumCircuit`` to ``qc``.
        backend: ``"aer_simulator"`` or an IBM Quantum backend name returned
            by :func:`list_backends`.
        timeout: Seconds to wait for a real-hardware job to complete
            (ignored for the simulator).

    Returns:
        The counts dict, or ``None`` if the circuit code is invalid, or the
        real-hardware run fails or doesn't complete in time.
    """
    try:
        from qiskit import QuantumCircuit

        local_ns: dict[str, object] = {}
        exec(code, {"__builtins__": __builtins__}, local_ns)  # noqa: S102
        qc = local_ns.get("qc")
        if not isinstance(qc, QuantumCircuit):
            raise ValueError("Circuit code must assign a QuantumCircuit to 'qc'")

        if backend == "aer_simulator":
            from qiskit import transpile
            from qiskit_aer import AerSimulator

            simulator = AerSimulator()
            compiled = transpile(qc, simulator)
            result = simulator.run(compiled, shots=1024).result()
            return dict(result.get_counts())

        from qiskit import transpile
        from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

        service = QiskitRuntimeService(token=os.getenv("IBMQ_API_TOKEN", ""))
        real_backend = service.backend(backend)
        compiled = transpile(qc, real_backend)
        job = SamplerV2(mode=real_backend).run([compiled])
        pub_result = job.result(timeout=timeout)[0]
        creg_name = qc.cregs[0].name
        return dict(getattr(pub_result.data, creg_name).get_counts())
    except Exception:  # noqa: BLE001
        return None


def list_backends() -> list[str]:
    """List available backends: ``aer_simulator`` plus any IBM Quantum
    backends when ``IBMQ_API_TOKEN`` is set."""
    backends = ["aer_simulator"]
    token = os.getenv("IBMQ_API_TOKEN", "")
    if token:
        try:
            from qiskit_ibm_runtime import QiskitRuntimeService

            service = QiskitRuntimeService(token=token)
            backends += [b.name for b in service.backends()]
        except Exception:  # noqa: BLE001
            pass
    return backends


def explain_with_bob(
    code: str,
    mcp_url: str = "http://localhost:8765",
    timeout: float = 60.0,
) -> str | None:
    """Call the bob4q MCP server's ``explain_circuit`` tool directly — the
    same tool IBM Bob calls when you ask it about a circuit in chat.

    Returns the explanation text, or ``None`` if the MCP server isn't running
    in ``--http`` mode.
    """
    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(f"{mcp_url}/tools/explain_circuit", json={"code": code})
            resp.raise_for_status()
            return resp.json().get("result")
    except httpx.HTTPError:
        return None

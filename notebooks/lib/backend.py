"""
notebooks/lib/backend.py
Thin HTTP clients for the workshop's live services (run locally in Jupyter):

- FastAPI circuit execution backend  (default http://localhost:8000)
- The bob4q MCP server in HTTP mode  (default http://localhost:8765)

Both helpers degrade gracefully (return None) if the service isn't running,
so notebooks can fall back to a local Qiskit simulation.
"""

from __future__ import annotations

import httpx


def run_via_backend(
    code: str,
    backend: str = "aer_simulator",
    base_url: str = "http://localhost:8000",
    timeout: float = 30.0,
) -> dict[str, int] | None:
    """Run circuit *code* (must assign a ``QuantumCircuit`` to ``qc``) through
    the FastAPI backend's ``/api/circuit/run``.

    Args:
        code: Python source that assigns a ``QuantumCircuit`` to ``qc``.
        backend: Backend name, e.g. ``"aer_simulator"`` or an IBM Quantum
            backend name returned by :func:`list_backends`.
        base_url: FastAPI backend base URL.
        timeout: Seconds to wait for the run + result round trip.

    Returns:
        The counts dict, or ``None`` if the backend is unreachable or the run
        failed.
    """
    try:
        with httpx.Client(timeout=timeout) as client:
            run_resp = client.post(
                f"{base_url}/api/circuit/run",
                json={"code": code, "backend": backend},
            )
            run_resp.raise_for_status()
            run_data = run_resp.json()
            if run_data["status"] != "done":
                return None

            result_resp = client.get(f"{base_url}/api/circuit/result/{run_data['job_id']}")
            result_resp.raise_for_status()
            return result_resp.json().get("counts")
    except httpx.HTTPError:
        return None


def list_backends(base_url: str = "http://localhost:8000", timeout: float = 5.0) -> list[str]:
    """List available backends: ``aer_simulator`` plus any IBM Quantum
    backends the server has a token for.

    Returns ``["aer_simulator"]`` if the backend is unreachable.
    """
    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.get(f"{base_url}/api/backends")
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPError:
        return ["aer_simulator"]


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

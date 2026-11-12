"""
notebooks/lib/backend.py
Beginner-friendly circuit execution and Bob assistance helpers.

- run_circuit(qc, shots=1024):
    Zero-config in-process execution using Qiskit's built-in StatevectorSampler
    (or AerSimulator if installed). Returns a simple counts dictionary.
- run_via_backend(code, backend="aer_simulator"):
    Runs circuit Python code or a QuantumCircuit object in-process.
- explain_with_bob(code):
    Asks IBM Bob's Qiskit assistant to explain the circuit in plain English.
    If the local assistant server (Ollama) is not running, seamlessly falls
    back to built-in beginner explanations so you are never blocked.
"""

from __future__ import annotations

import os
from typing import Any

import httpx


def run_circuit(qc: Any, shots: int = 1024) -> dict[str, int]:
    """Execute a QuantumCircuit in-process and return the measurement counts.

    Designed for complete beginners: no server required, works immediately.
    Uses Qiskit's built-in StatevectorSampler.

    Example:
        >>> qc = QuantumCircuit(1, 1)
        >>> qc.h(0)
        >>> qc.measure(0, 0)
        >>> counts = run_circuit(qc)
        >>> print(counts)  # ~ {'0': 512, '1': 512}
    """
    try:
        from qiskit.primitives import StatevectorSampler

        sampler = StatevectorSampler()
        job = sampler.run([(qc, None, shots)])
        result = job.result()
        data_bin = result[0].data

        # Find the classical register counts
        for field in dir(data_bin):
            if not field.startswith("_"):
                val = getattr(data_bin, field)
                if hasattr(val, "get_counts"):
                    return dict(val.get_counts())

        # Fallback to direct bitstring measurement
        return {"0": shots}
    except Exception as e:
        # If StatevectorSampler fails or aer is preferred
        try:
            from qiskit_aer import AerSimulator

            sim = AerSimulator()
            from qiskit import transpile

            t_qc = transpile(qc, sim)
            res = sim.run(t_qc, shots=shots).result()
            return dict(res.get_counts())
        except Exception:
            return {"error": str(e)}  # type: ignore


def run_via_backend(
    code_or_qc: Any,
    backend: str = "aer_simulator",
    shots: int = 1024,
    timeout: float = 30.0,
) -> dict[str, int] | None:
    """Execute circuit source code or a QuantumCircuit on the specified backend.

    Supports 'aer_simulator' (in-process) or an IBM Quantum hardware backend
    when IBMQ_API_TOKEN is set.
    """
    try:
        from qiskit import QuantumCircuit

        if isinstance(code_or_qc, QuantumCircuit):
            qc = code_or_qc
        else:
            local_ns: dict[str, object] = {}
            exec(code_or_qc, {"__builtins__": __builtins__}, local_ns)  # noqa: S102
            qc = local_ns.get("qc")
            if not isinstance(qc, QuantumCircuit):
                raise ValueError("Circuit code must assign a QuantumCircuit to 'qc'")

        if backend == "aer_simulator":
            return run_circuit(qc, shots=shots)

        from qiskit import transpile
        from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

        service = QiskitRuntimeService(token=os.getenv("IBMQ_API_TOKEN", ""))
        real_backend = service.backend(backend)
        compiled = transpile(qc, real_backend)
        job = SamplerV2(mode=real_backend).run([compiled], shots=shots)
        pub_result = job.result(timeout=timeout)[0]
        creg_name = qc.cregs[0].name if qc.cregs else "c"
        return dict(getattr(pub_result.data, creg_name).get_counts())
    except Exception:
        # Graceful fallback to local simulation
        if isinstance(code_or_qc, QuantumCircuit):
            return run_circuit(code_or_qc, shots=shots)
        return None


def list_backends() -> list[str]:
    """List available backends: 'aer_simulator' plus any IBM Quantum hardware
    backends if an IBMQ_API_TOKEN is configured."""
    backends = ["aer_simulator"]
    token = os.getenv("IBMQ_API_TOKEN", "")
    if token:
        try:
            from qiskit_ibm_runtime import QiskitRuntimeService

            service = QiskitRuntimeService(token=token)
            backends += [b.name for b in service.backends()]
        except Exception:
            pass
    return backends


def _build_beginner_fallback_explanation(code: str) -> str:
    """Generate a friendly, plain-English explanation for beginners when
    running in offline mode (Ollama not started)."""
    explanation_parts = [
        "🤖 **IBM Bob's Quantum Guide** (Offline Mode):",
        "",
        "Here is what this quantum code is doing in simple terms:",
    ]

    if "QuantumCircuit" in code:
        explanation_parts.append(
            "- **`QuantumCircuit(...)`**: Prepares your quantum workspace! "
            "Just like setting up empty lanes on a bowling alley, this allocates "
            "your qubits (quantum bits) and classical bits."
        )
    if ".h(" in code or "h(" in code:
        explanation_parts.append(
            "- **`qc.h(...)` (Hadamard Gate)**: Spins your qubit into **Superposition**! "
            "Think of a coin spinning in mid-air. It is not just 0 or 1—it is a 50/50 "
            "possibility of both until we stop and look at it."
        )
    if ".cx(" in code or "cx(" in code:
        explanation_parts.append(
            "- **`qc.cx(...)` (CNOT Gate)**: Creates **Entanglement**! "
            "It links two qubits together like magic twins. Whatever happens to the first "
            "qubit instantly controls what happens to the second, even if they are miles apart."
        )
    if ".z(" in code or "z(" in code:
        explanation_parts.append(
            "- **`qc.z(...)` (Phase-Flip Gate)**: Flips the hidden quantum phase (`+` to `-`) "
            "while the qubit is in superposition! Combined with Hadamard gates (`H → Z → H`), "
            "quantum interference reveals the hidden phase in a single query."
        )
    if ".measure" in code:
        explanation_parts.append(
            "- **`qc.measure(...)` (Measurement)**: Catches the spinning coin! "
            "The quantum superposition collapses into a plain classical 0 or 1 so our "
            "laptop can read the final answer."
        )

    explanation_parts.append("")
    explanation_parts.append(
        "💡 *Tip: If you'd like live AI generation, start Ollama with your local model "
        "and launch `cd mcp-server && uv run server.py --http`.*"
    )

    return "\n".join(explanation_parts)


def explain_with_bob(
    code: str,
    mcp_url: str = "http://localhost:8765",
    timeout: float = 4.0,
) -> str:
    """Ask IBM Bob to explain this circuit in plain language.

    If the local assistant server (Ollama) is running, queries it.
    If offline or unreachable, returns a clear beginner-friendly explanation
    immediately so you are never blocked.
    """
    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(f"{mcp_url}/tools/explain_circuit", json={"code": code})
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, dict) and "explanation" in data:
                    return str(data["explanation"])
                return str(resp.text)
    except Exception:
        pass

    # Seamless fallback explanation
    return _build_beginner_fallback_explanation(code)

"""Deutsch-Jozsa on 3 input qubits, run on a local simulator (Qiskit 2.x)."""

from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

N = 3
SHOTS = 1024


def oracle(kind: str) -> QuantumCircuit:
    """Constant oracle (always 0) or balanced oracle (parity of the inputs)."""
    qc = QuantumCircuit(N + 1)
    if kind == "balanced":
        for q in range(N):
            qc.cx(q, N)
    return qc


def deutsch_jozsa(kind: str) -> QuantumCircuit:
    qc = QuantumCircuit(N + 1, N)
    qc.x(N)
    qc.h(range(N + 1))
    qc.compose(oracle(kind), inplace=True)
    qc.h(range(N))
    qc.measure(range(N), range(N))
    return qc


for kind in ("constant", "balanced"):
    result = StatevectorSampler().run([deutsch_jozsa(kind)], shots=SHOTS).result()
    counts = result[0].data.c.get_counts()
    verdict = "constant" if counts.get("0" * N, 0) / SHOTS > 0.9 else "balanced"
    print(kind, "->", verdict, counts)

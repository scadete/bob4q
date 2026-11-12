"""Deutsch-Jozsa on 3 input qubits (Qiskit 1.x style)."""

from qiskit import QuantumCircuit
from qiskit.primitives import Sampler

N = 3


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
    qc = deutsch_jozsa(kind)
    result = Sampler().run(qc, shots=1024).result()
    dist = result.quasi_dists[0].binary_probabilities()
    verdict = "constant" if dist.get("0" * N, 0) > 0.9 else "balanced"
    print(kind, "->", verdict, dist)

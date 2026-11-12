# Quantum Advantage & Oracles

This is the module that answers *why quantum can be faster at all*. It walks through the
**Bernstein–Vazirani algorithm**: a hidden function returns a single parity bit from several
inputs, and there's a real, measurable gap between how many times you must ask it classically
versus quantumly.

---

## 1. The hidden function

Let `SECRET` be an unknown bitstring of length `n`. The oracle answers:

$$f(x) = \bigoplus_i (x_i \cdot s_i)$$

— the parity (XOR) of `x` bitwise-AND `SECRET`. Neither side gets to read `SECRET` directly,
only to call `f(x)`.

---

## 2. Classical: one query per bit

Querying at the unit vector $e_i$ (all zeros except a `1` at position $i$) isolates exactly
`SECRET[i]`, since the AND picks out only that bit. Recovering the whole secret takes **n
queries**, tallying one revealed bit per query — no shortcut classically.

---

## 3. Quantum: one query, total

$$H^{\otimes n}\,U_f\,H^{\otimes n}|0\rangle^{\otimes n}|-\rangle = |s\rangle|-\rangle$$

Put an ancilla qubit in $|-\rangle$ (via `X` then `H`), superpose all `n` data qubits with `H`,
then apply the oracle **once** as a single unitary — a `CX` from data qubit $i$ to the ancilla
wherever `SECRET[i] == 1`. Because the ancilla is in $|-\rangle$, each `CX` **kicks its phase
back** onto the data qubit instead of flipping the ancilla. A final layer of `H` gates turns
that phase pattern directly into `SECRET`, measured in one shot:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(n + 1, n)
qc.x(n)               # ancilla → |1⟩
qc.h(range(n + 1))     # superpose everything; ancilla is now |-⟩

for i, bit in enumerate(SECRET):
    if bit == "1":
        qc.cx(i, n)    # phase kickback onto qubit i whenever SECRET[i] == 1

qc.h(range(n))
qc.measure(range(n), range(n))
```

---

## 4. Same answer, radically fewer queries

Both sides recover the identical secret. The classical side needed `n` queries; the quantum side
needed exactly **1**. This one-query-oracle idea — mark information in phase, then read it out
via interference — is exactly what **Grover's algorithm** generalizes to *search* in the next
module, the capstone.

---

## Further Reading

- `notebooks/04-quantum-advantage-oracles.ipynb` — the hands-on version, with both sides run and verified
- [Bernstein–Vazirani algorithm — Qiskit textbook](https://learning.quantum.ibm.com)

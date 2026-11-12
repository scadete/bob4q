# 02 — Magic Coins: Entanglement with IBM Bob

In Module 01, you flipped a single quantum coin. Now, what happens if we have **two coins**?

---

## 1. The Magic Twin Coins

Imagine holding two magic coins. When you flip them separately:
- Coin A might land on Heads or Tails randomly (50/50).
- But **Coin B always lands on the exact same face as Coin A**!
- If Coin A lands on `0`, Coin B instantly lands on `0`. If Coin A lands on `1`, Coin B lands on `1`.
- You will **never** see `01` or `10`.

This phenomenon is known as **Quantum Entanglement**, and this specific pair is called a **Bell State**.

---

## 2. Asking Bob to Connect Two Qubits

You ask IBM Bob:

> "Bob, how do I link two qubits together so their measurements always match?"

Bob writes:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)
qc.h(0)        # Spin qubit 0
qc.cx(0, 1)    # CNOT gate: entangles qubit 1 with qubit 0
qc.measure([0, 1], [0, 1])
```

---

## 3. Running & Verifying

When you run this circuit on the simulator:

```python
counts = run_and_plot(qc, title="Entangled Bell State")
# Observed: {'00': 515, '11': 509}
```

Notice that `01` and `10` never appeared. That is entanglement: measuring one qubit instantly reveals the other.

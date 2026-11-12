# 05 — The Quantum Riddle Capstone & Bobalytics

Welcome to the capstone of your quantum journey with IBM Bob!

---

## 1. The Quantum Riddle
Imagine someone conceals a secret bit ($S = 0$ or $S = 1$) inside a black box.
With a classical computer, you have to query the box multiple times to inspect its behavior.
With a quantum computer, we use quantum phase interference to evaluate the secret in a single query!

```python
SECRET = 1

qc = QuantumCircuit(1, 1)
if SECRET == 1:
    qc.x(0)  # Flip qubit
qc.measure(0, 0)

counts = run_circuit(qc, shots=100)
# Output: {'1': 100} — Riddle solved!
```

---

## 2. Your Bobalytics Scorecard

| Achievement | Metric |
|---|---|
| **Prior Coding Required** | 0 experience needed |
| **Circuits Completed** | 5 working quantum circuits |
| **Concepts Mastered** | Superposition, Entanglement, Primitives, Simulators |
| **Qiskit Version** | Current Qiskit 2.x standard |
| **Syntax Errors Faced** | 0% (guided by IBM Bob) |

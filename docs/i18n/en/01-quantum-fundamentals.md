# Quantum Fundamentals

This document introduces the core concepts you will explore in the workshop lab.

---

## 1. What is a Qubit?

A **qubit** (quantum bit) is the fundamental unit of quantum information.

Unlike a classical bit (which is always `0` or `1`), a qubit can exist in a **superposition** of both states simultaneously:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

where $\alpha$ and $\beta$ are **complex probability amplitudes** satisfying:

$$|\alpha|^2 + |\beta|^2 = 1$$

When you **measure** a qubit, the superposition collapses — you get `0` with probability $|\alpha|^2$ or `1` with probability $|\beta|^2$.

---

## 2. Superposition

The **Hadamard (H) gate** puts a qubit into equal superposition:

$$H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) = |{+}\rangle$$

In Qiskit:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)
qc.h(0)          # Hadamard gate
qc.measure(0, 0)
print(qc.draw())
```

Running this circuit many times gives ~50% `0` and ~50% `1`.

---

## 3. Entanglement

**Quantum entanglement** links two (or more) qubits so that the state of one immediately determines the state of the other — regardless of distance.

The **Bell state** $|\Phi^+\rangle$ is the simplest entangled state:

$$|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$

To create it in Qiskit:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)
qc.h(0)       # Superpose qubit 0
qc.cx(0, 1)   # CNOT: qubit 0 controls qubit 1
qc.measure([0, 1], [0, 1])
print(qc.draw())
```

Measurement results are always **correlated**: you will only ever see `00` or `11`, never `01` or `10`.

---

## 4. Running Circuits

In the lab, you will run circuits on the **Aer simulator** (local, no account needed):

```python
from qiskit_aer import AerSimulator
from qiskit import transpile

simulator = AerSimulator()
compiled = transpile(qc, simulator)
job = simulator.run(compiled, shots=1024)
result = job.result()
print(result.get_counts())
```

The output shows how many times each measurement outcome appeared across 1024 shots.

---

## Further Reading

- [Qiskit documentation](https://docs.quantum.ibm.com)
- [IBM Quantum Learning](https://learning.quantum.ibm.com)

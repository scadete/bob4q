# 01 — Hello Quantum: Your First Qubit with IBM Bob

Welcome to the **Quantum Experience Lab**! This lab is designed for complete beginners who have never programmed before.
With **IBM Bob** as your AI pair programmer, you will write and run your very first quantum circuit in just a few minutes.

---

## 1. What is a Qubit?

- **Classical bit (regular computers):** Like a light switch on a wall. It is either completely **OFF (0)** or completely **ON (1)**.
- **Quantum bit / Qubit (quantum computers):** Like a **spinning coin**. While it spins in the air, it is in a **superposition** of both Heads and Tails! Only when you catch it (measure it) does it land on a definitive 0 or 1.

---

## 2. Asking Bob to Build the Circuit

In IBM Bob's chat, you can simply say:

> "Hey Bob, I've never programmed before. Can you write a simple Qiskit circuit that flips a quantum coin with 50/50 odds, and explain what each line does?"

Bob generates clean, 3-line modern Qiskit code:

```python
from qiskit import QuantumCircuit

# 1 qubit (the spinning coin) and 1 classical bit (the table where it lands)
qc = QuantumCircuit(1, 1)

# Apply the Hadamard gate (H) to spin the coin into superposition
qc.h(0)

# Catch the coin and read the result
qc.measure(0, 0)
```

---

## 3. Running It on the Simulator

We run the circuit 1,024 times ("shots"). Because the coin is in equal superposition, approximately 50% of the runs land on 0, and 50% land on 1.

```python
from lib.visuals import run_and_plot

counts = run_and_plot(qc, title="Quantum Coin Toss")
# Output: {'0': 518, '1': 506}
```

---

## What's Next?
Continue to **Module 02** to see what happens when you connect two qubits into entangled magic twins!

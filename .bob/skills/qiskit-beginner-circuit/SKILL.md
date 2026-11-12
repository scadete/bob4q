---
name: qiskit-beginner-circuit
description: Turn a plain-English idea into a short, runnable circuit in the latest Qiskit (2.x) for someone new to programming. Use when the user runs /qiskit-beginner-circuit, or asks for a first quantum circuit, a quantum coin, or "make a circuit that ..." in everyday words.
---
# qiskit-beginner-circuit

Write a first quantum circuit from a plain-English idea.

## Instructions

1. Restate the idea in one sentence using an everyday picture: a light switch
   (classical bit), a spinning coin (superposition) or magic twin dice
   (entanglement).
2. Write the circuit in the latest Qiskit (2.x): `QuantumCircuit`, run with
   `StatevectorSampler`. Never use the removed `execute()`.
3. Keep it under 10 lines with a short comment on each gate.
4. Create the circuit with an explicit classical register, as in
   `QuantumCircuit(1, 1)`, and measure with `qc.measure(0, 0)`. Do not use
   `measure_all()`: it names the register `meas`. Read the counts with
   `result[0].data.c.get_counts()`.
5. Save it as a `.py` file named by the user, or `circuit.py` if none is given.
6. Run it with 1000 shots and show the counts. Run the file with
   `uv run --with qiskit python <file>` so no global install is needed.
7. Explain the result in two sentences with the same picture. If the docs MCP
   server `qiskit-docs` is available, call `search_docs_tool` for the main gate
   and link the page you used.
8. End with one friendly tip about a common beginner slip (for example,
   forgetting to measure).

## Example

`/qiskit-beginner-circuit a coin that lands heads or tails with equal chance`
produces `coin.py` with one qubit, an `h` gate and a measurement, and counts
close to 500 and 500.

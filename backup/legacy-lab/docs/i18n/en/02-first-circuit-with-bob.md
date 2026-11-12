# First Circuit with IBM Bob

Notebook 01 covered the fundamentals in isolation. From here on, every module runs the workshop's
core loop: **See it → Ask Bob → Run it → Read it**. This one runs it for the first time, on the
Bell circuit you already know.

---

## 1. Ask Bob

IBM Bob is an **agentic** assistant — it doesn't just answer, it calls tools. When you ask it
about a circuit, it reaches the **Qiskit Code Assistant** through MCP (Model Context Protocol),
a custom server this workshop ships in `mcp-server/`. In Bob's chat, try:

> "Write a Qiskit Bell state circuit with 2 qubits and explain what it does."

Bob calls the MCP tool `explain_circuit(code: str) -> str`, which forwards your circuit to a
local Granite model (via Ollama) and returns a plain-language explanation. The workshop notebook
also calls this same tool directly over HTTP, so you can see exactly what Bob sees.

---

## 2. The circuit

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)
qc.h(0)          # Hadamard on qubit 0
qc.cx(0, 1)      # CNOT: control=0, target=1
qc.measure([0, 1], [0, 1])
```

---

## 3. Run it

The circuit runs in-process, right in your notebook's own kernel — `run_via_backend()`
(`notebooks/lib/backend.py`) executes it directly on the **Aer simulator**, no server involved:

```python
run_via_backend(code, backend="aer_simulator")
  → {"00": 512, "11": 512}
```

This is the path IBM Bob's live demo uses too — the circuit Bob writes is the circuit that runs
here.

---

## 4. Read it

Only `00` and `11` should appear — never `01` or `10`. Bob reads this back as: "these two qubits
are correlated, never `01` or `10`" — the same entanglement behavior from notebook 01, now
produced by a circuit Bob helped write and a service Bob helped run.

---

## Further Reading

- `notebooks/02-first-circuit-with-bob.ipynb` — the hands-on version of this loop
- [Model Context Protocol](https://modelcontextprotocol.io)

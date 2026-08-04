# Grover SAT Capstone

The capstone: **Grover's algorithm** generalizes the previous module's one-query oracle trick to
*search*. An oracle **phase-flips** the amplitude of the state(s) that satisfy your problem;
**diffusion** then reflects every amplitude about the mean, amplifying the marked one. Repeat
~π/4·√N times and the answer dominates — a **provable quadratic speedup** over checking N
possibilities one by one.

Here, the "problem" is a small **boolean satisfiability (SAT) formula**, and the two workshop
threads pay off together: a real quantum advantage, produced by Bob and the Qiskit Code
Assistant MCP tool it reaches — locally or remotely.

---

## 1. Pick a formula

```python
FORMULA = "(a & b) & ~c"
```

`PhaseOracle` uses this exact `&` / `|` / `~` syntax. This formula has a single satisfying
assignment (`a=1, b=1, c=0`) among its 8 possible inputs.

---

## 2. Ask Bob to author the oracle

In IBM Bob's chat:

> "Build a Qiskit Grover search circuit that finds the satisfying assignment of the boolean
> formula (a & b) & ~c using PhaseOracle."

This is where the workshop's two design threads meet: Bob reaches the **Qiskit Code Assistant**
through MCP to write and explain the oracle — the same tool whether the MCP server is running
**locally** on your machine or on a **shared remote server** (`mcp-server/server.py --http`) —
with you in the loop the whole way.

```python
from qiskit.circuit.library import PhaseOracle

oracle = PhaseOracle("(a & b) & ~c")
```

---

## 3. Build and run Grover

```python
import math
from qiskit_algorithms import Grover, AmplificationProblem

problem = AmplificationProblem(oracle)
n_iterations = round(math.pi / 4 * math.sqrt(2**oracle.num_qubits))  # ≈ 2 for N = 8

grover = Grover(iterations=n_iterations)
qc = grover.construct_circuit(problem, power=n_iterations, measurement=True)
```

This runs through the same `/api/circuit/run` → Aer path as every other module — just with a
bigger circuit. The backend needs `qiskit-algorithms` installed alongside `qiskit` for `Grover`
and `AmplificationProblem` to be importable (see `backend/pyproject.toml`).

---

## 4. Read it & verify

The histogram converges on the marked assignment (~95% of shots for this formula, at the
computed optimal iteration count). To confirm this isn't a fluke, cross-check against a
classical brute-force search over all 8 assignments — the workshop's advantage claim is
**observed and verified**, not just asserted.

---

## What's next?

`PhaseOracle` + `Grover` gives a provable quadratic speedup for SAT because the oracle is
constructed directly from the formula — no quantum arithmetic required. For *optimization*
problems (QUBO), the same amplitude-amplification idea extends via **Grover Adaptive Search** —
a forward-looking next step beyond this workshop, where Bob could help author a QUBO oracle.

---

## Further Reading

- `notebooks/05-grover-sat-capstone.ipynb` — the hands-on version of this capstone
- [Grover's algorithm — Qiskit textbook](https://learning.quantum.ibm.com)

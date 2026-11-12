# Legacy fixture: Deutsch-Jozsa in Qiskit 1.x

Small, self-contained input for use case 3 (migrate old code to Qiskit 2.x).
Written for this workshop, not copied from a project. One file, no account,
no hardware.

## What it does

Deutsch-Jozsa on 3 input qubits plus one ancilla. A constant oracle (always 0)
and a balanced oracle (parity of the inputs, built from CX gates). One query
decides which kind it is: all-zeros means constant, anything else means balanced.

## Verified behaviour (2026-11-12)

| Environment | Result |
|---|---|
| `uv run --with qiskit==1.4.2 python deutsch_jozsa.py` | Runs. Prints `constant -> constant {'000': 1.0}` and `balanced -> balanced {'111': 1.0}`. Emits `DeprecationWarning` for the V1 `Sampler` (deprecated in 1.2). |
| `uv run --with qiskit python deutsch_jozsa.py` (2.6.2) | Fails: `ImportError: cannot import name 'Sampler' from 'qiskit.primitives'` |

## What must change for Qiskit 2.x

| Old (1.x) | New (2.x) |
|---|---|
| `from qiskit.primitives import Sampler` | `from qiskit.primitives import StatevectorSampler` |
| `Sampler().run(qc, shots=1024)` | `StatevectorSampler().run([qc], shots=1024)` (list of circuits) |
| `result.quasi_dists[0].binary_probabilities()` | `result[0].data.c.get_counts()`, then divide by the shots |

The circuit code (`QuantumCircuit`, `h`, `cx`, `x`, `measure`, `compose`) needs no change.

## Scope note

`migrate-qiskit-ibm-runtime` states that it does **not** rewrite the Qiskit
reference primitives (`from qiskit.primitives import ...`); it covers only
`qiskit-ibm-runtime`. Its registry does treat `quasi_dists` as a decisive tell
for the Runtime V1 primitives, so it may still activate here. Do not claim the
skill performs this migration until a recording shows what it actually does.

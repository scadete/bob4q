# Legacy fixture: Qiskit 0.43 Grover notebook

Input for use case 3 (`migrate-qiskit-ibm-runtime`). Real notebook from the
author's own project, copied unchanged except that cell outputs are cleared.

- Source: `quantum-search-example` repo, commit `dc57ad4` (2023-05-21).
- Environment it was written for (`requirements-qiskit-lines.txt`): `qiskit` 0.43.0,
  `qiskit-terra` 0.24.0, `qiskit-aer` 0.12.0, `qiskit-ibm-runtime` 0.10.0,
  `qiskit-ibmq-provider` 0.20.2, Python 3.10.
- Not run: the old stack was not installed and the notebook was not executed.

## Old patterns it contains

| Layer | Pattern | Cell |
|---|---|---|
| Qiskit core | `from qiskit import Aer`, `Aer.get_backend('qasm_simulator')` | 2, 8 |
| Qiskit core | `qiskit.algorithms` (`AmplificationProblem`, `Grover`) | 2, 10, 11, 18 |
| Qiskit core | V1 `qiskit.primitives.Sampler` | 11, 13, 18 |
| Qiskit core | `PhaseOracle` and `oracle.evaluate_bitstring` | 15, 17, 21 |
| Runtime | `QiskitRuntimeService(channel='ibm_quantum', ...)` | 20 |
| Runtime | `Options`, `Session(service=..., backend=...)`, V1 runtime `Sampler`, `result.quasi_dists` | 20, 21, 22 |
| Backend | `ibmq_belem` (retired) | 20 |

The `migrate-qiskit-ibm-runtime` skill covers only the Runtime rows. The Qiskit
core rows are outside its scope; Bob with the docs MCP handles those.

## Variants

- `quantum-search-example.ipynb`: the full original (23 cells), including the
  real-hardware section (cells 19 to 22).
- `quantum-search-example.no-hardware.ipynb`: cells 0 to 18 only. The hardware
  section is removed: no `qiskit_ibm_runtime`, no `Session`, no `ibmq_belem`, no
  `quasi_dists`. Use this for the workshop recording; it needs no IBM account.

With the hardware section removed, the old patterns left are the Qiskit core rows
only (`Aer`, `qiskit.algorithms`, V1 `Sampler`, `PhaseOracle`). The
`migrate-qiskit-ibm-runtime` skill has no Runtime code to act on in this variant.

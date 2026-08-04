# Simulator vs Real QPU

Everything so far ran on **Aer**, a classical simulator: fast, free, and noiseless. IBM Quantum
backends are real superconducting qubits — the same Qiskit code, but subject to real
decoherence and gate error.

---

## 1. What backends are available?

```
GET /api/backends
  → ["aer_simulator"]                                  # no IBMQ_API_TOKEN set
  → ["aer_simulator", "ibm_brisbane", "ibm_kyiv", ...]  # token set
```

The backend server (`backend/routers/backends.py`) always lists `aer_simulator`. It adds real
IBM Quantum backends only when an `IBMQ_API_TOKEN` environment variable is configured (see
`.env.example`).

---

## 2. Same code, different backend

The exact same circuit runs on either target — only the `backend` field changes:

```
POST /api/circuit/run   { "code": "...", "backend": "aer_simulator" }
POST /api/circuit/run   { "code": "...", "backend": "ibm_brisbane" }
```

---

## 3. Graceful degradation

Without a token, the workshop still runs completely: every module before this one is simulator-
only, and this module simply skips the real-hardware step with a note. With a token, the same
Bell circuit that gave a clean `00`/`11` split on Aer will show some `01`/`10` counts leaking in
— real decoherence and gate error the simulator doesn't model. Real hardware also queues: a job
can take anywhere from seconds to hours depending on backend load.

---

## Further Reading

- `notebooks/03-simulator-vs-qpu.ipynb` — the hands-on version of this comparison
- [IBM Quantum backends](https://quantum.ibm.com)

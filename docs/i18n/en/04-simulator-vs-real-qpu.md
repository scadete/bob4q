# 04 — Flight Simulator vs Real Rocket

Where do quantum circuits actually run?

---

## 1. The Flight Simulator (Local Laptop)
- Runs on your laptop's regular processor (CPU).
- Uses mathematical linear algebra to simulate quantum physics.
- **Benefits:** Instant feedback, completely free, zero queue wait, and zero noise.

---

## 2. The Real Rocket (IBM Quantum Hardware)
- Sends instructions to a physical dilution refrigerator kept at 15 millikelvin (-273°C).
- Qubits are fabricated superconducting circuits manipulated by microwave pulses.
- **Benefits:** Demonstrates real physical quantum mechanics and tests hardware fidelity.

---

## 3. Safe Execution Code

With modern Qiskit, you can prototype on your simulator and transition to real hardware with the exact same circuit:

```python
# Prototype locally for free:
from lib.backend import run_circuit
counts = run_circuit(qc, shots=1024)

# When ready for real hardware:
# from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
# service = QiskitRuntimeService(token=os.getenv("IBMQ_API_TOKEN"))
# sampler = SamplerV2(mode=service.least_busy(simulator=False))
# job = sampler.run([qc])
```

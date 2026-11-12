# 03 — Modern Qiskit & AI Guardrails

When searching for quantum tutorials on the internet, you will often find code written years ago (2020–2021).
With **Qiskit 1.0** (2024) and today's **Qiskit 2.x** series, obsolete functions like `qiskit.execute()` have been replaced by high-performance **Primitives**.

---

## 1. Upgrading Obsolete Code

Old tutorial code:
```python
# ⚠️ Deprecated pattern
from qiskit import execute, Aer
job = execute(qc, Aer.get_backend('qasm_simulator'), shots=1024)
```

IBM Bob automatically upgrades this to clean current Qiskit 2.x:

```python
from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler()
job = sampler.run([(qc, None, 1024)])
counts = dict(job.result()[0].data.c.get_counts())
```

---

## 2. Friendly Error Prevention

What if a beginner accidentally forgets to add measurement gates?

```python
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
# No measurement!
```

Bob detects the missing measurement *before execution*:
> "💡 **IBM Bob**: You have entangled the qubits, but you haven't added measurement gates! Without measuring, the classical computer cannot read the outcome. Let's add `qc.measure_all()`."

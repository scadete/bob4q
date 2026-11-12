# 03 — Qiskit Moderno e Proteções com IA

Ao pesquisar tutoriais de computação quântica na internet, é muito comum encontrar códigos antigos (2020–2021).
Com o **Qiskit 1.0** (2024) e a série atual **Qiskit 2.x**, funções obsoletas como `qiskit.execute()` foram substituídas pelas **Primitivas**.

---

## 1. Atualizando Códigos Obsoletos

Código antigo com advertência:
```python
# ⚠️ Padrão descontinuado
from qiskit import execute, Aer
job = execute(qc, Aer.get_backend('qasm_simulator'), shots=1024)
```

O IBM Bob atualiza automaticamente para o padrão moderno:

```python
from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler()
job = sampler.run([(qc, None, 1024)])
counts = dict(job.result()[0].data.c.get_counts())
```

---

## 2. Prevenção Amigável de Falhas

Se você esquecer de colocar portas de medição:

```python
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
# Sem medição!
```

O Bob detecta antes da execução:
> "💡 **IBM Bob**: Você emaranhou os qubits, mas não adicionou portas de medição! Sem medir, o computador clássico não consegue ler a resposta. Vamos adicionar `qc.measure_all()`."

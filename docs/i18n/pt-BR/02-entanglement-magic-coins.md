# 02 — Moedas Mágicas: Emaranhamento com IBM Bob

No Módulo 01, você girou uma única moeda quântica. E se tivermos **duas moedas**?

---

## 1. As Moedas Mágicas Gêmeas

Imagine duas moedas mágicas. Ao girá-las separadamente:
- A Moeda A pode cair em cara ou coroa aleatoriamente (50/50).
- Mas a **Moeda B sempre cai exatamente na mesma face que a Moeda A**!
- Se a Moeda A for `0`, a Moeda B é instantaneamente `0`. Se a Moeda A for `1`, a Moeda B é `1`.
- Você **nunca** verá `01` ou `10`.

Esse fenômeno é chamado de **Emaranhamento Quântico** (ou **Estado de Bell**).

---

## 2. Pedindo para o Bob Conectar Dois Qubits

Você pergunta ao IBM Bob:

> "Bob, como conecto dois qubits para que seus resultados sempre coincidam?"

O Bob escreve:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)
qc.h(0)        # Gira o qubit 0
qc.cx(0, 1)    # Porta CNOT: emaranha o qubit 1 com o qubit 0
qc.measure([0, 1], [0, 1])
```

---

## 3. Execução e Verificação

Executando no simulador:

```python
counts = run_and_plot(qc, title="Estado de Bell Emaranhado")
# Observado: {'00': 515, '11': 509}
```

Observe que `01` e `10` nunca ocorreram!

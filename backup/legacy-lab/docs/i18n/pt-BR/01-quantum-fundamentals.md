# Fundamentos Quânticos

Este documento apresenta os conceitos fundamentais que você vai explorar no laboratório do workshop.

---

## 1. O que é um Qubit?

Um **qubit** (bit quântico) é a unidade fundamental da informação quântica.

Ao contrário de um bit clássico (que é sempre `0` ou `1`), um qubit pode existir em uma **superposição** de ambos os estados simultaneamente:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

onde $\alpha$ e $\beta$ são **amplitudes de probabilidade complexas** que satisfazem:

$$|\alpha|^2 + |\beta|^2 = 1$$

Quando você **mede** um qubit, a superposição colapsa — você obtém `0` com probabilidade $|\alpha|^2$ ou `1` com probabilidade $|\beta|^2$.

---

## 2. Superposição

A **porta Hadamard (H)** coloca um qubit em superposição igual:

$$H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) = |{+}\rangle$$

No Qiskit:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)
qc.h(0)          # Porta Hadamard
qc.measure(0, 0)
print(qc.draw())
```

Executar este circuito várias vezes dá ~50% `0` e ~50% `1`.

---

## 3. Emaranhamento

O **emaranhamento quântico** conecta dois (ou mais) qubits de forma que o estado de um determina imediatamente o estado do outro — independentemente da distância.

O **estado de Bell** $|\Phi^+\rangle$ é o estado emaranhado mais simples:

$$|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$

Para criá-lo no Qiskit:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)
qc.h(0)       # Superpor qubit 0
qc.cx(0, 1)   # CNOT: qubit 0 controla qubit 1
qc.measure([0, 1], [0, 1])
print(qc.draw())
```

Os resultados de medição são sempre **correlacionados**: você só verá `00` ou `11`, nunca `01` ou `10`.

---

## 4. Executando Circuitos

No laboratório, você vai executar circuitos no **simulador Aer** (local, sem necessidade de conta):

```python
from qiskit_aer import AerSimulator
from qiskit import transpile

simulator = AerSimulator()
compiled = transpile(qc, simulator)
job = simulator.run(compiled, shots=1024)
result = job.result()
print(result.get_counts())
```

A saída mostra quantas vezes cada resultado de medição apareceu em 1024 execuções.

---

## Leitura Adicional

- [Documentação do Qiskit](https://docs.quantum.ibm.com)
- [IBM Quantum Learning](https://learning.quantum.ibm.com)

# Vantagem Quântica & Oráculos

Este é o módulo que responde *por que a computação quântica pode ser mais rápida*. Ele percorre
o **algoritmo de Bernstein–Vazirani**: uma função oculta retorna um único bit de paridade a
partir de várias entradas, e existe uma diferença real e mensurável entre quantas vezes você
precisa consultá-la classicamente versus quanticamente.

---

## 1. A função oculta

Seja `SECRET` uma bitstring desconhecida de comprimento `n`. O oráculo responde:

$$f(x) = \bigoplus_i (x_i \cdot s_i)$$

— a paridade (XOR) de `x` operado com AND bit a bit com `SECRET`. Nenhum dos lados pode ler
`SECRET` diretamente, apenas chamar `f(x)`.

---

## 2. Clássico: uma consulta por bit

Consultar no vetor unitário $e_i$ (todos zeros exceto um `1` na posição $i$) isola exatamente
`SECRET[i]`, já que o AND seleciona apenas esse bit. Recuperar o segredo inteiro exige **n
consultas**, revelando um bit por consulta — não há atalho classicamente.

---

## 3. Quântico: uma única consulta, no total

$$H^{\otimes n}\,U_f\,H^{\otimes n}|0\rangle^{\otimes n}|-\rangle = |s\rangle|-\rangle$$

Coloque um qubit ancilla em $|-\rangle$ (via `X` seguido de `H`), superponha os `n` qubits de
dados com `H`, e então aplique o oráculo **uma única vez** como um único unitário — um `CX` do
qubit de dados $i$ para a ancilla sempre que `SECRET[i] == 1`. Como a ancilla está em
$|-\rangle$, cada `CX` **retroalimenta a fase** (phase kickback) no qubit de dados em vez de
inverter a ancilla. Uma camada final de portas `H` transforma esse padrão de fase diretamente em
`SECRET`, medido em uma única execução:

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(n + 1, n)
qc.x(n)               # ancilla → |1⟩
qc.h(range(n + 1))     # superpõe tudo; a ancilla agora está em |-⟩

for i, bit in enumerate(SECRET):
    if bit == "1":
        qc.cx(i, n)    # phase kickback no qubit i sempre que SECRET[i] == 1

qc.h(range(n))
qc.measure(range(n), range(n))
```

---

## 4. Mesma resposta, muito menos consultas

Ambos os lados recuperam o mesmo segredo. O lado clássico precisou de `n` consultas; o lado
quântico precisou de exatamente **1**. Essa ideia de oráculo de uma única consulta — marcar
informação na fase e depois lê-la via interferência — é exatamente o que o **algoritmo de
Grover** generaliza para *busca* no próximo módulo, o capstone.

---

## Leitura Adicional

- `notebooks/04-quantum-advantage-oracles.ipynb` — a versão prática, com os dois lados executados e verificados
- [Algoritmo de Bernstein–Vazirani — Qiskit textbook](https://learning.quantum.ibm.com)

# Capstone: Grover para SAT

O capstone: o **algoritmo de Grover** generaliza o truque de oráculo de uma única consulta do
módulo anterior para *busca*. Um oráculo **inverte a fase** da amplitude do(s) estado(s) que
satisfazem seu problema; a **difusão** então reflete todas as amplitudes em torno da média,
amplificando a marcada. Repita ~π/4·√N vezes e a resposta domina — uma **vantagem quadrática
comprovável** sobre verificar N possibilidades uma a uma.

Aqui, o "problema" é uma pequena **fórmula de satisfatibilidade booleana (SAT)**, e os dois fios
condutores do workshop se encontram: uma vantagem quântica real, produzida pelo Bob e pela
ferramenta MCP do Qiskit Code Assistant que ele acessa — localmente ou remotamente.

---

## 1. Escolha uma fórmula

```python
FORMULA = "(a & b) & ~c"
```

O `PhaseOracle` usa exatamente essa sintaxe `&` / `|` / `~`. Esta fórmula tem uma única
atribuição satisfatória (`a=1, b=1, c=0`) entre suas 8 entradas possíveis.

---

## 2. Peça ao Bob para autorar o oráculo

No chat do IBM Bob:

> "Construa um circuito de busca de Grover em Qiskit que encontre a atribuição satisfatória da
> fórmula booleana (a & b) & ~c usando PhaseOracle."

É aqui que os dois fios condutores do workshop se encontram: o Bob acessa o **Qiskit Code
Assistant** via MCP para escrever e explicar o oráculo — a mesma ferramenta, seja o servidor MCP
rodando **localmente** na sua máquina ou em um **servidor remoto compartilhado**
(`mcp-server/server.py --http`) — com você no controle o tempo todo.

```python
from qiskit.circuit.library import PhaseOracle

oracle = PhaseOracle("(a & b) & ~c")
```

---

## 3. Construa e execute o Grover

```python
import math
from qiskit_algorithms import Grover, AmplificationProblem

problem = AmplificationProblem(oracle)
n_iterations = round(math.pi / 4 * math.sqrt(2**oracle.num_qubits))  # ≈ 2 para N = 8

grover = Grover(iterations=n_iterations)
qc = grover.construct_circuit(problem, power=n_iterations, measurement=True)
```

Isso roda pelo mesmo caminho `/api/circuit/run` → Aer que todo outro módulo — só que com um
circuito maior. O backend precisa ter `qiskit-algorithms` instalado junto com `qiskit` para que
`Grover` e `AmplificationProblem` sejam importáveis (veja `backend/pyproject.toml`).

---

## 4. Leia e verifique

O histograma converge na atribuição marcada (~95% das execuções para esta fórmula, na contagem
ótima de iterações calculada). Para confirmar que isso não é coincidência, faça a verificação
cruzada com uma busca clássica por força bruta sobre as 8 atribuições — a alegação de vantagem
do workshop é **observada e verificada**, não apenas afirmada.

---

## O que vem a seguir?

`PhaseOracle` + `Grover` oferece uma vantagem quadrática comprovável para SAT porque o oráculo é
construído diretamente a partir da fórmula — sem necessidade de aritmética quântica. Para
problemas de *otimização* (QUBO), a mesma ideia de amplificação de amplitude se estende via
**Grover Adaptive Search** — um próximo passo, além deste workshop, no qual o Bob poderia ajudar
a construir um oráculo QUBO.

---

## Leitura Adicional

- `notebooks/05-grover-sat-capstone.ipynb` — a versão prática deste capstone
- [Algoritmo de Grover — Qiskit textbook](https://learning.quantum.ibm.com)

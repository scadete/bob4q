# Primeiro Circuito com o IBM Bob

O notebook 01 cobriu os fundamentos isoladamente. A partir daqui, todo módulo executa o loop
central do workshop: **Ver → Perguntar ao Bob → Executar → Ler**. Este módulo executa esse loop
pela primeira vez, no circuito de Bell que você já conhece.

---

## 1. Pergunte ao Bob

O IBM Bob é um assistente **agêntico** — ele não apenas responde, ele chama ferramentas. Quando
você pergunta sobre um circuito, ele aciona o **Qiskit Code Assistant** via MCP (Model Context
Protocol), um servidor customizado que este workshop disponibiliza em `mcp-server/`. No chat do
Bob, tente:

> "Escreva um circuito de estado de Bell em Qiskit com 2 qubits e explique o que ele faz."

O Bob chama a ferramenta MCP `explain_circuit(code: str) -> str`, que encaminha seu circuito
para um modelo Granite local (via Ollama) e retorna uma explicação em linguagem natural. O
notebook do workshop também chama essa mesma ferramenta diretamente via HTTP, para que você veja
exatamente o que o Bob vê.

---

## 2. O circuito

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)
qc.h(0)          # Hadamard no qubit 0
qc.cx(0, 1)      # CNOT: controle=0, alvo=1
qc.measure([0, 1], [0, 1])
```

---

## 3. Execute

O circuito roda in-process, no próprio kernel do seu notebook — `run_via_backend()`
(`notebooks/lib/backend.py`) o executa diretamente no **simulador Aer**, sem nenhum servidor
envolvido:

```python
run_via_backend(code, backend="aer_simulator")
  → {"00": 512, "11": 512}
```

Este é o mesmo caminho que a demonstração ao vivo do IBM Bob usa — o circuito que o Bob escreve é
o circuito que roda aqui.

---

## 4. Leia o resultado

Só devem aparecer `00` e `11` — nunca `01` ou `10`. O Bob interpreta isso como: "esses dois
qubits estão correlacionados, nunca `01` ou `10`" — o mesmo comportamento de emaranhamento do
notebook 01, agora produzido por um circuito que o Bob ajudou a escrever e um serviço que o Bob
ajudou a executar.

---

## Leitura Adicional

- `notebooks/02-first-circuit-with-bob.ipynb` — a versão prática deste loop
- [Model Context Protocol](https://modelcontextprotocol.io)

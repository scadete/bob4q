# 01 — Olá Quântico: Seu Primeiro Qubit com IBM Bob

Bem-vindo ao **Quantum Experience Lab**! Este laboratório foi feito para iniciantes completos sem experiência em programação.
Com o **IBM Bob** como seu par de programação com IA, você construirá seu primeiro circuito quântico em minutos.

---

## 1. O que é um Qubit?

- **Bit clássico (computador comum):** Como um interruptor de luz na parede. Está **DESLIGADO (0)** ou **LIGADO (1)**.
- **Bit quântico / Qubit (computador quântico):** Como uma **moeda girando no ar**. Enquanto gira, está em **superposição** de cara e coroa ao mesmo tempo! Somente quando a seguramos (medimos) ela cai em 0 ou 1.

---

## 2. Pedindo para o Bob Criar o Circuito

No chat do IBM Bob, você pode simplesmente dizer:

> "Olá Bob, nunca programei antes. Você pode escrever um circuito Qiskit simples que lance uma moeda quântica com chances 50/50 e explicar o que cada linha faz?"

O Bob gera um código limpo de 3 linhas no Qiskit moderno:

```python
from qiskit import QuantumCircuit

# 1 qubit (a moeda girando) e 1 bit clássico (para anotar o resultado)
qc = QuantumCircuit(1, 1)

# Aplica a porta Hadamard (H) para colocar a moeda em superposição
qc.h(0)

# Mede a moeda e registra o resultado
qc.measure(0, 0)
```

---

## 3. Executando no Simulador

Executamos o circuito 1.024 vezes ("shots"). Como a moeda está em superposição equilibrada, esperamos aproximadamente 50% de zeros e 50% de uns.

```python
from lib.visuals import run_and_plot

counts = run_and_plot(qc, title="Cara ou Coroa Quântico")
# Resultado: {'0': 518, '1': 506}
```

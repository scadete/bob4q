# 05 — Enigma Quântico e Bobalytics

Bem-vindo ao projeto final da sua jornada quântica com o IBM Bob!

---

## 1. O Enigma da Moeda Secreta
Imagine alguém escondendo um bit secreto ($S = 0$ ou $S = 1$) dentro de uma caixa preta.
No computador clássico, precisamos inspecionar várias vezes para ter certeza do estado.
No computador quântico, usamos interferência de fase quântica para descobrir o segredo em uma única medição!

```python
SECRET = 1

qc = QuantumCircuit(1, 1)
if SECRET == 1:
    qc.x(0)  # Inverte o qubit
qc.measure(0, 0)

counts = run_circuit(qc, shots=100)
# Saída: {'1': 100} — Enigma resolvido!
```

---

## 2. Seu Painel de Conquistas Bobalytics

| Conquista | Métrica |
|---|---|
| **Experiência Prévia Necessária** | 0 (Acessível a qualquer iniciante) |
| **Circuitos Criados** | 5 circuitos quânticos funcionais |
| **Conceitos Dominados** | Superposição, Emaranhamento, Primitivas, Simuladores |
| **Versão do Qiskit** | Padrão atual Qiskit 2.x |
| **Erros de Sintaxe** | 0% (com o apoio do IBM Bob) |

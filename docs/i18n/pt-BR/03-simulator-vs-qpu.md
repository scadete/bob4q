# Simulador vs QPU Real

Até aqui, tudo rodou no **Aer**, um simulador clássico: rápido, gratuito e sem ruído. Os
backends do IBM Quantum são qubits supercondutores reais — o mesmo código Qiskit, mas sujeito a
decoerência e erro de porta reais.

---

## 1. Quais backends estão disponíveis?

```
GET /api/backends
  → ["aer_simulator"]                                  # sem IBMQ_API_TOKEN configurado
  → ["aer_simulator", "ibm_brisbane", "ibm_kyiv", ...]  # com token configurado
```

O servidor de backend (`backend/routers/backends.py`) sempre lista `aer_simulator`. Ele
adiciona backends reais do IBM Quantum apenas quando uma variável de ambiente `IBMQ_API_TOKEN`
está configurada (veja `.env.example`).

---

## 2. Mesmo código, backend diferente

Exatamente o mesmo circuito roda em qualquer um dos dois alvos — apenas o campo `backend` muda:

```
POST /api/circuit/run   { "code": "...", "backend": "aer_simulator" }
POST /api/circuit/run   { "code": "...", "backend": "ibm_brisbane" }
```

---

## 3. Degradação graciosa

Sem um token, o workshop continua funcionando completamente: todo módulo anterior a este é
apenas simulador, e este módulo simplesmente pula a etapa de hardware real com uma observação.
Com um token, o mesmo circuito de Bell que dava uma divisão limpa `00`/`11` no Aer vai mostrar
algumas contagens de `01`/`10` vazando — decoerência e erro de porta reais que o simulador não
modela. Hardware real também entra em fila: um job pode levar de segundos a horas, dependendo da
carga do backend.

---

## Leitura Adicional

- `notebooks/03-simulator-vs-qpu.ipynb` — a versão prática desta comparação
- [Backends do IBM Quantum](https://quantum.ibm.com)

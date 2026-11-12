# 04 — Simulador de Voo vs Foguete Real

Onde os circuitos quânticos realmente são executados?

---

## 1. O Simulador de Voo (Notebook Local)
- Executa no processador (CPU) do seu computador.
- Usa cálculos de álgebra linear para simular o comportamento quântico.
- **Vantagens:** Resposta instantânea, 100% gratuito, sem filas e sem ruído físico.

---

## 2. O Foguete Real (Hardware IBM Quantum)
- Envia instruções para um refrigerador de diluição a -273°C em um data center da IBM Quantum.
- Os qubits são circuitos supercondutores físicos reais controlados por micro-ondas.
- **Vantagens:** Validação física em escala real de processamento quântico.

---

## 3. Código Seguro de Execução

No Qiskit moderno, você desenvolve no simulador e passa para o hardware real com o mesmo código:

```python
# Prototipando gratuitamente no simulador local:
from lib.backend import run_circuit
counts = run_circuit(qc, shots=1024)

# Quando estiver pronto para hardware real da IBM:
# from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
# service = QiskitRuntimeService(token=os.getenv("IBMQ_API_TOKEN"))
# sampler = SamplerV2(mode=service.least_busy(simulator=False))
# job = sampler.run([qc])
```

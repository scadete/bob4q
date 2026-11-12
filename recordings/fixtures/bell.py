from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

result = StatevectorSampler().run([qc], shots=1000).result()
print(result[0].data.c.get_counts())

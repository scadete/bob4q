import { Suspense } from "react";
import SlideShow from "@/components/SlideShow";
import type { Slide } from "@/components/SlideShow";
import Link from "next/link";
import { Button } from "@carbon/react";

const slides: Slide[] = [
  {
    title: "Quantum Experience Lab",
    body: "Hands-on quantum computing with IBM Bob + Qiskit",
  },
  {
    title: "What is a Qubit?",
    body: "A qubit is the fundamental unit of quantum information. Unlike a classical bit, it can exist in a superposition of 0 and 1 simultaneously.",
    animation: "qubit",
  },
  {
    title: "Superposition",
    body: "Applying a Hadamard gate puts a qubit into equal superposition — equal probability of measuring 0 or 1.",
    animation: "superposition",
  },
  {
    title: "Entanglement",
    body: "Two entangled qubits share a quantum state — measuring one instantly determines the other, regardless of distance.",
    animation: "entanglement",
  },
  {
    title: "IBM Bob + Qiskit Workflow",
    body: "IBM Bob uses an MCP server to expose Qiskit tools: run circuits, explain code with AI, and list available backends.",
  },
  {
    title: "Live Demo",
    body: "Open the lab to write and run your first quantum circuit.",
    component: (
      <Button as={Link} href="/lab" size="lg" style={{ marginBottom: "1.5rem" }}>
        Open Lab →
      </Button>
    ),
  },
];

export default function DemoPage() {
  return (
    <Suspense>
      <SlideShow slides={slides} />
    </Suspense>
  );
}

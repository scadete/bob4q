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
    title: "Today's arc",
    body: "Two threads, one loop: quantum concepts, and IBM Bob as your pair-programmer for building them. We'll end by answering the real question — when is quantum actually faster, and can an AI help you build the circuit that proves it?",
  },
  {
    title: "Meet IBM Bob",
    body: "IBM Bob is an agentic assistant — it doesn't just answer, it calls tools. MCP (Model Context Protocol) lets Bob reach a Qiskit Code Assistant to write and explain real circuits — the same tool, whether it's running on your own machine or on a shared remote server — with you in the loop the whole way.",
    animation: "agenticLoop",
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
    title: "Measurement & statistics",
    body: "Measuring a qubit collapses it to a classical 0 or 1 — but a single shot only tells you the outcome, not the odds. Repeat the same circuit many times and the histogram of outcomes converges to the true probabilities.",
    animation: "resultsHistogram",
  },
  {
    title: "Entanglement",
    body: "Two entangled qubits share a quantum state — measuring one instantly determines the other, regardless of distance.",
    animation: "entanglement",
  },
  {
    title: "Gates & circuits",
    body: "A circuit reads left to right: gates (X, H) act on wires (qubits), a two-wire gate like CNOT entangles them, and a meter measures. Learning to read this diagram is what lets you — and Bob — talk about a circuit precisely.",
    animation: "gates",
  },
  {
    title: "Ask Bob to build it",
    body: "Live: ask Bob to build the Bell circuit. Bob calls the MCP tool explain_circuit — the same Qiskit Code Assistant wired into Bob's MCP config — and returns working Qiskit code plus a plain-language explanation.",
  },
  {
    title: "Run & read it",
    body: "The code Bob wrote runs through FastAPI's /api/circuit/run on the Aer simulator. The result: a counts histogram peaked at 00 and 11 — Bob reads it back as \"these two qubits are correlated, never 01 or 10.\"",
    animation: "resultsHistogram",
  },
  {
    title: "Classical parity check",
    body: "Say a hidden function returns a single parity bit from several inputs. Classically there's no shortcut: you query it once per input, tallying results as you go, before you can compute the parity.",
    animation: "parity",
  },
  {
    title: "Quantum parity check",
    body: "Put the same inputs in superposition and query the oracle once. Phase kickback writes the answer into every branch's phase at once; interference collects it into a single, certain outcome. Same answer, one query instead of many — this oracle trick is exactly what Grover generalizes next.",
    animation: "parity",
  },
  {
    title: "Simulator vs real QPU",
    body: "Everything so far ran on Aer, a classical simulator — fast, free, noiseless. IBM Quantum backends are real superconducting qubits: same Qiskit code, but subject to real decoherence and gate error. FastAPI picks the backend; with an IBMQ_API_TOKEN set, the same circuit can target real hardware.",
  },
  {
    title: "The oracle & search",
    body: "Grover generalizes the parity trick to search: an oracle phase-flips the amplitude of the state(s) that satisfy your problem, then diffusion reflects every amplitude about the mean, amplifying the marked one. Repeat ~π/4·√N times and the answer dominates — a quadratic speedup over checking N possibilities one by one.",
    animation: "amplitudeAmplification",
  },
  {
    title: "Build a SAT oracle with Bob",
    body: "Capstone: pick a small boolean formula. Ask Bob — reaching the Qiskit Code Assistant MCP, whether it's running on your laptop or a shared remote server — to author the PhaseOracle that marks its satisfying assignment. Run Grover on the simulator and watch the histogram converge on the answer, verified against a classical brute-force check.",
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

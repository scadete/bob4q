import { promises as fs } from "fs";
import path from "path";

/**
 * Notebooks are authored and committed under the repo-root `notebooks/` folder
 * and executed locally by developers (see the "Run locally" panel in the lab
 * UI). The web app only presents them read-only, so this module reads the
 * `.ipynb` JSON from disk and exposes a flat list of cells to render.
 *
 * Path convention matches the docs loader: files live one level above the
 * frontend package (`process.cwd()/../notebooks`).
 */

export interface NotebookMeta {
  /** URL slug, e.g. "01-quantum-fundamentals" */
  slug: string;
  /** File name under notebooks/, e.g. "01-quantum-fundamentals.ipynb" */
  file: string;
  /** Repo-relative path shown to the developer */
  repoPath: string;
  title: string;
  description: string;
  /** Pinned qiskit version for the "run locally" command. Defaults to "1.2.0". */
  qiskitVersion?: string;
  /** Extra `--with` packages beyond jupyterlab/qiskit/matplotlib/pylatexenc. */
  extraDeps?: string[];
}

export interface NotebookCell {
  type: "markdown" | "code";
  source: string;
}

/**
 * Registry of notebooks presented in the lab. Order is presentation order.
 * Add an entry here when a new notebook lands in `notebooks/`.
 */
export const NOTEBOOKS: NotebookMeta[] = [
  {
    slug: "01-quantum-fundamentals",
    file: "01-quantum-fundamentals.ipynb",
    repoPath: "notebooks/01-quantum-fundamentals.ipynb",
    title: "Quantum Fundamentals",
    description:
      "Build your first qubit, put it in superposition, and create a Bell state — using Qiskit's StatevectorSampler.",
  },
  {
    slug: "02-first-circuit-with-bob",
    file: "02-first-circuit-with-bob.ipynb",
    repoPath: "notebooks/02-first-circuit-with-bob.ipynb",
    title: "First Circuit with IBM Bob",
    description:
      "Ask Bob to write and explain a Bell circuit, then run it locally on the Aer simulator.",
    extraDeps: ["httpx", "qiskit-aer"],
  },
  {
    slug: "03-simulator-vs-qpu",
    file: "03-simulator-vs-qpu.ipynb",
    repoPath: "notebooks/03-simulator-vs-qpu.ipynb",
    title: "Simulator vs Real QPU",
    description:
      "Run the same circuit on Aer and, when an IBMQ_API_TOKEN is set, on real IBM Quantum hardware.",
    extraDeps: ["httpx", "qiskit-aer", "qiskit-ibm-runtime"],
  },
  {
    slug: "04-quantum-advantage-oracles",
    file: "04-quantum-advantage-oracles.ipynb",
    repoPath: "notebooks/04-quantum-advantage-oracles.ipynb",
    title: "Quantum Advantage & Oracles",
    description:
      "Recover a hidden bitstring classically (one query per bit) vs quantumly (one query, via phase kickback) — the Bernstein–Vazirani algorithm.",
    extraDeps: ["httpx"],
  },
  {
    slug: "05-grover-sat-capstone",
    file: "05-grover-sat-capstone.ipynb",
    repoPath: "notebooks/05-grover-sat-capstone.ipynb",
    title: "Grover SAT Capstone",
    description:
      "Ask Bob to author a PhaseOracle for a boolean formula, run Grover on the Aer simulator, and verify the result against a classical brute-force search.",
    qiskitVersion: "2.0.0",
    extraDeps: ["httpx", "qiskit-algorithms==0.4.0", "qiskit-aer"],
  },
];

export function listNotebooks(): NotebookMeta[] {
  return NOTEBOOKS;
}

export function getNotebookMeta(slug: string): NotebookMeta | undefined {
  return NOTEBOOKS.find((n) => n.slug === slug);
}

/** ipynb cell `source` is either a string or an array of line strings. */
function joinSource(source: unknown): string {
  if (Array.isArray(source)) return source.join("");
  if (typeof source === "string") return source;
  return "";
}

/** Reads a notebook file and returns its cells as {type, source}. */
export async function loadNotebookCells(file: string): Promise<NotebookCell[]> {
  const filePath = path.join(process.cwd(), "..", "notebooks", file);
  const raw = await fs.readFile(filePath, "utf8");
  const nb = JSON.parse(raw) as {
    cells?: Array<{ cell_type: string; source: unknown }>;
  };

  return (nb.cells ?? [])
    .filter((c) => c.cell_type === "markdown" || c.cell_type === "code")
    .map((c) => ({
      type: c.cell_type as "markdown" | "code",
      source: joinSource(c.source),
    }));
}

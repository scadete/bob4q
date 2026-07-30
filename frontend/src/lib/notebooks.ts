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

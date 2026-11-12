import { promises as fs } from "fs";
import path from "path";
import { defaultLocale } from "@/i18n/config";

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
  /**
   * URL slug and English file basename, e.g. "01-quantum-fundamentals".
   * Title/description live in `messages/{locale}.json` under `notebooks.<slug>`.
   */
  slug: string;
  /** Optional pinned qiskit version for the "run locally" command. Defaults to the latest release (2.x). */
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
 *
 * Localized copies sit next to the English file as `<slug>.<locale>.ipynb`
 * (e.g. `01-quantum-fundamentals.pt-BR.ipynb`) so they share `notebooks/lib/`.
 */
export const NOTEBOOKS: NotebookMeta[] = [
  { slug: "01-hello-quantum-with-bob", extraDeps: ["httpx"] },
  { slug: "02-entanglement-magic-coins", extraDeps: ["httpx"] },
  { slug: "03-modern-qiskit-guardrails", extraDeps: ["httpx"] },
  {
    slug: "04-simulator-vs-real-qpu",
    extraDeps: ["httpx", "qiskit-aer", "qiskit-ibm-runtime"],
  },
  { slug: "05-bobalytics-and-capstone", extraDeps: ["httpx"] },
];

export function listNotebooks(): NotebookMeta[] {
  return NOTEBOOKS;
}

export function getNotebookMeta(slug: string): NotebookMeta | undefined {
  const normalized = slug.replace(/\.ipynb$/, "");
  return NOTEBOOKS.find((n) => n.slug === normalized);
}

const notebooksDir = (): string => path.join(process.cwd(), "..", "notebooks");

/** File name of a notebook for a locale (English is the un-suffixed file). */
export function notebookFileName(slug: string, locale: string): string {
  return locale === defaultLocale ? `${slug}.ipynb` : `${slug}.${locale}.ipynb`;
}

export interface ResolvedNotebook {
  /** File name under notebooks/ */
  file: string;
  /** Repo-relative path shown to the developer */
  repoPath: string;
  /** True when no translation exists and the English file is used instead. */
  isFallback: boolean;
}

/** Picks the localized notebook file if present, else the English one. */
export async function resolveNotebook(
  slug: string,
  locale: string
): Promise<ResolvedNotebook> {
  const localized = notebookFileName(slug, locale);
  let file = localized;
  let isFallback = false;
  if (locale !== defaultLocale) {
    try {
      await fs.access(path.join(notebooksDir(), localized));
    } catch {
      file = notebookFileName(slug, defaultLocale);
      isFallback = true;
    }
  }
  return { file, repoPath: `notebooks/${file}`, isFallback };
}

/** ipynb cell `source` is either a string or an array of line strings. */
function joinSource(source: unknown): string {
  if (Array.isArray(source)) return source.join("");
  if (typeof source === "string") return source;
  return "";
}

/** Reads a notebook file and returns its cells as {type, source}. */
export async function loadNotebookCells(file: string): Promise<NotebookCell[]> {
  const filePath = path.join(notebooksDir(), file);
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

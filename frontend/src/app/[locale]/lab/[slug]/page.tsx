import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { remark } from "remark";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import {
  getNotebookMeta,
  listNotebooks,
  loadNotebookCells,
} from "@/lib/notebooks";
import { NotebookView, type RenderedCell } from "@/components/NotebookView";

export function generateStaticParams() {
  return listNotebooks().map((n) => ({ slug: n.slug }));
}

async function markdownToHtml(md: string): Promise<string> {
  const processed = await remark()
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(md);
  return processed.toString();
}

export default async function NotebookPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations("lab");
  const meta = getNotebookMeta(slug);

  if (!meta) {
    return (
      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 1rem" }}>
        <Link href={`/${locale}/lab`} style={{ color: "var(--cds-link-primary)" }}>
          {t("back")}
        </Link>
        <p style={{ color: "var(--cds-text-secondary)", marginTop: "1rem" }}>
          {t("not_found")}
        </p>
      </main>
    );
  }

  const cells = await loadNotebookCells(meta.file);
  const rendered: RenderedCell[] = await Promise.all(
    cells.map(async (c): Promise<RenderedCell> =>
      c.type === "markdown"
        ? { type: "markdown", html: await markdownToHtml(c.source) }
        : { type: "code", code: c.source }
    )
  );

  const runCommand = `uv run --with jupyterlab --with qiskit==1.2.0 --with matplotlib --with pylatexenc \\
  jupyter lab ${meta.repoPath}`;

  return (
    <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link
        href={`/${locale}/lab`}
        style={{ color: "var(--cds-link-primary)", fontSize: "0.875rem" }}
      >
        {t("back")}
      </Link>

      <h1 style={{ margin: "1rem 0 0.5rem", fontWeight: 300 }}>{meta.title}</h1>
      <p style={{ color: "var(--cds-text-secondary)", marginTop: 0 }}>
        {meta.description}
      </p>

      {/* Run-locally panel: point the developer at the file + a copy-paste command */}
      <section
        style={{
          margin: "1.5rem 0 2rem",
          padding: "1rem 1.25rem",
          background: "var(--cds-layer-01, #262626)",
          borderRadius: "2px",
        }}
      >
        <strong style={{ display: "block", marginBottom: "0.5rem" }}>
          {t("run_locally")}
        </strong>
        <p style={{ margin: "0 0 0.5rem", color: "var(--cds-text-secondary)" }}>
          {t("run_hint")}{" "}
          <code style={{ color: "var(--cds-text-primary)" }}>{meta.repoPath}</code>
        </p>
        <pre
          style={{
            margin: 0,
            padding: "0.75rem 1rem",
            background: "var(--cds-layer-02, #393939)",
            borderRadius: "2px",
            overflowX: "auto",
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontSize: "0.8125rem",
          }}
        >
          <code>{runCommand}</code>
        </pre>
      </section>

      <NotebookView cells={rendered} />
    </main>
  );
}

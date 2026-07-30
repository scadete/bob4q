/**
 * Read-only renderer for a notebook. Markdown cells are pre-rendered to HTML
 * (KaTeX-aware) by the page; code cells are shown as syntax-neutral <pre>
 * blocks. This is a presentational server component — no interactivity.
 */

export type RenderedCell =
  | { type: "markdown"; html: string }
  | { type: "code"; code: string };

export function NotebookView({ cells }: { cells: RenderedCell[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {cells.map((cell, i) =>
        cell.type === "markdown" ? (
          <article
            key={i}
            className="prose"
            dangerouslySetInnerHTML={{ __html: cell.html }}
            style={{ color: "var(--cds-text-primary)" }}
          />
        ) : (
          <pre
            key={i}
            style={{
              margin: 0,
              padding: "1rem 1.25rem",
              background: "var(--cds-layer-01, #262626)",
              borderLeft: "3px solid var(--cds-border-interactive, #4589ff)",
              borderRadius: "2px",
              overflowX: "auto",
              fontFamily:
                "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              color: "var(--cds-text-primary, #f4f4f4)",
            }}
          >
            <code>{cell.code}</code>
          </pre>
        )
      )}
    </div>
  );
}

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
  resolveNotebook,
} from "@/lib/notebooks";
import { NotebookView, type RenderedCell } from "@/components/NotebookView";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

// next-intl's getTranslations reads request headers, which cannot happen during
// static generation for this route, so render per request.
export const dynamic = "force-dynamic";

async function markdownToHtml(md: string, locale: string): Promise<string> {
  // Rewrite relative Jupyter links (./02-foo.ipynb) to web route links (/${locale}/lab/02-foo)
  const webMd = md.replace(
    /\]\(\.\/([a-z0-9-]+)\.ipynb\)/gi,
    `](/${locale}/lab/$1)`
  );
  const processed = await remark()
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(webMd);
  return processed.toString();
}

export default async function NotebookPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations("lab");
  const nav = await getTranslations("nav");
  const allNotebooks = listNotebooks();
  const currentIndex = allNotebooks.findIndex((n) => n.slug === slug);
  const meta = getNotebookMeta(slug);

  const crumbLink = {
    color: "var(--cds-link-primary)",
    textDecoration: "none",
  } as const;
  const breadcrumb = (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
        fontSize: "0.875rem",
      }}
    >
      <Link href={`/${locale}`} style={crumbLink}>
        {nav("home")}
      </Link>
      <span style={{ color: "var(--cds-text-helper)" }}>/</span>
      <Link href={`/${locale}/lab#notebooks`} style={crumbLink}>
        {t("back")}
      </Link>
      {currentIndex !== -1 && (
        <>
          <span style={{ color: "var(--cds-text-helper)" }}>/</span>
          <span style={{ color: "var(--cds-text-secondary)" }}>
            {t("step_counter", {
              current: currentIndex + 1,
              total: allNotebooks.length,
            })}
          </span>
        </>
      )}
      <span style={{ marginLeft: "auto" }}>
        <LocaleSwitcher />
      </span>
    </nav>
  );

  if (!meta) {
    return (
      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 1rem" }}>
        {breadcrumb}
        <p style={{ color: "var(--cds-text-secondary)", marginTop: "1rem" }}>
          {t("not_found")}
        </p>
      </main>
    );
  }

  const tnb = await getTranslations("notebooks");
  const title = tnb(`${meta.slug}.title`);
  const description = tnb(`${meta.slug}.description`);
  const prevMeta = currentIndex > 0 ? allNotebooks[currentIndex - 1] : undefined;
  const nextMeta =
    currentIndex >= 0 && currentIndex < allNotebooks.length - 1
      ? allNotebooks[currentIndex + 1]
      : undefined;

  const { file, repoPath, isFallback } = await resolveNotebook(meta.slug, locale);
  const cells = await loadNotebookCells(file);
  const rendered: RenderedCell[] = await Promise.all(
    cells.map(async (c): Promise<RenderedCell> =>
      c.type === "markdown"
        ? { type: "markdown", html: await markdownToHtml(c.source, locale) }
        : { type: "code", code: c.source }
    )
  );

  const deps = [
    "jupyterlab",
    meta.qiskitVersion ? `qiskit==${meta.qiskitVersion}` : "qiskit",
    "matplotlib",
    "pylatexenc",
    ...(meta.extraDeps ?? []),
  ];
  const runCommand = `uv run ${deps.map((d) => `--with ${d}`).join(" ")} \\\n  jupyter lab ${repoPath}`;

  return (
    <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 1rem" }}>
      {breadcrumb}

      {/* 5-step notebook switcher bar */}
      <nav
        aria-label="Notebooks"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${allNotebooks.length}, minmax(0, 1fr))`,
          gap: "0.5rem",
          marginTop: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {allNotebooks.map((nb, idx) => {
          const isActive = nb.slug === meta.slug;
          const stepNum = String(idx + 1).padStart(2, "0");
          return (
            <Link
              key={nb.slug}
              href={`/${locale}/lab/${nb.slug}`}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                padding: "0.625rem 0.75rem",
                background: isActive
                  ? "var(--cds-layer-selected-01)"
                  : "var(--cds-layer-01)",
                borderTop: isActive
                  ? "3px solid var(--cds-border-interactive)"
                  : "3px solid var(--cds-border-subtle)",
                borderRadius: "2px",
                textDecoration: "none",
                color: isActive
                  ? "var(--cds-text-primary)"
                  : "var(--cds-text-secondary)",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: isActive
                    ? "var(--cds-link-primary)"
                    : "var(--cds-text-helper)",
                }}
              >
                {stepNum}
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tnb(`${nb.slug}.title`).replace(/^\d+\s*—\s*/, "")}
              </span>
            </Link>
          );
        })}
      </nav>

      <h1 style={{ margin: "1rem 0 0.5rem", fontWeight: 300 }}>{title}</h1>
      <p style={{ color: "var(--cds-text-secondary)", marginTop: 0 }}>
        {description}
      </p>

      {isFallback && (
        <p
          role="note"
          style={{
            margin: "1rem 0 0",
            padding: "0.75rem 1rem",
            borderLeft: "3px solid var(--cds-support-info)",
            background: "var(--cds-layer-01)",
            color: "var(--cds-text-secondary)",
            fontSize: "0.875rem",
          }}
        >
          {t("fallback_notice")}
        </p>
      )}

      {/* Run-locally panel: point the developer at the file + a copy-paste command */}
      <section
        style={{
          margin: "1.5rem 0 2rem",
          padding: "1rem 1.25rem",
          background: "var(--cds-layer-01)",
          borderRadius: "2px",
        }}
      >
        <strong style={{ display: "block", marginBottom: "0.5rem" }}>
          {t("run_locally")}
        </strong>
        <p style={{ margin: "0 0 0.5rem", color: "var(--cds-text-secondary)" }}>
          {t("run_hint")}{" "}
          <code style={{ color: "var(--cds-text-primary)" }}>{repoPath}</code>
        </p>
        <pre
          style={{
            margin: 0,
            padding: "0.75rem 1rem",
            background: "var(--cds-layer-02)",
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

      {/* Bottom Previous / Next notebook navigation */}
      <nav
        aria-label="Notebook pagination"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid var(--cds-border-subtle)",
        }}
      >
        {prevMeta ? (
          <Link
            href={`/${locale}/lab/${prevMeta.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              padding: "1.25rem",
              background: "var(--cds-layer-01)",
              borderLeft: "3px solid var(--cds-border-subtle)",
              borderRadius: "2px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--cds-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              ← {t("prev_notebook")}
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--cds-link-primary)",
              }}
            >
              {tnb(`${prevMeta.slug}.title`)}
            </span>
          </Link>
        ) : (
          <Link
            href={`/${locale}/lab#notebooks`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              padding: "1.25rem",
              background: "var(--cds-layer-01)",
              borderLeft: "3px solid var(--cds-border-subtle)",
              borderRadius: "2px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--cds-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              ← {t("back")}
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--cds-link-primary)",
              }}
            >
              {t("finish_lab")}
            </span>
          </Link>
        )}

        {nextMeta ? (
          <Link
            href={`/${locale}/lab/${nextMeta.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
              gap: "0.35rem",
              padding: "1.25rem",
              background: "var(--cds-layer-01)",
              borderRight: "3px solid var(--cds-border-interactive)",
              borderRadius: "2px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--cds-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {t("next_notebook")} →
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--cds-link-primary)",
              }}
            >
              {tnb(`${nextMeta.slug}.title`)}
            </span>
          </Link>
        ) : (
          <Link
            href={`/${locale}/lab#notebooks`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
              gap: "0.35rem",
              padding: "1.25rem",
              background: "var(--cds-layer-01)",
              borderRight: "3px solid var(--cds-border-interactive)",
              borderRadius: "2px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--cds-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {t("back")} →
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--cds-link-primary)",
              }}
            >
              {t("finish_lab")}
            </span>
          </Link>
        )}
      </nav>
    </main>
  );
}

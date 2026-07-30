import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listNotebooks } from "@/lib/notebooks";

export default async function LabPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("lab");
  const notebooks = listNotebooks();

  return (
    <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2.5rem 1rem" }}>
      <h1 style={{ fontWeight: 300, marginBottom: "0.5rem" }}>{t("title")}</h1>
      <p style={{ color: "var(--cds-text-secondary)", marginTop: 0 }}>
        {t("index_intro")}
      </p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "2rem" }}>
        {notebooks.map((nb) => (
          <li key={nb.slug} style={{ marginBottom: "1rem" }}>
            <Link
              href={`/${locale}/lab/${nb.slug}`}
              style={{
                display: "block",
                padding: "1.25rem 1.5rem",
                background: "var(--cds-layer-01, #262626)",
                borderLeft: "3px solid var(--cds-border-interactive, #4589ff)",
                borderRadius: "2px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 600,
                  color: "var(--cds-text-primary)",
                }}
              >
                {nb.title}
              </span>
              <span
                style={{
                  display: "block",
                  margin: "0.35rem 0 0.6rem",
                  color: "var(--cds-text-secondary)",
                  fontSize: "0.9375rem",
                }}
              >
                {nb.description}
              </span>
              <code
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--cds-text-helper, #8d8d8d)",
                }}
              >
                {nb.repoPath}
              </code>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

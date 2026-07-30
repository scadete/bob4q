import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { remark } from "remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function DocsPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations("docs");

  const docsDir = path.join(process.cwd(), "..", "docs", "i18n", locale);
  const filePath = path.join(docsDir, `${slug}.md`);

  let content: string;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return (
      <main style={{ padding: "2rem" }}>
        <p style={{ color: "var(--cds-text-secondary)" }}>{t("not_found")}</p>
      </main>
    );
  }

  const processed = await remark()
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(content);

  const html = processed.toString();

  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1rem" }}>
      <div
        style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "flex-end" }}
      >
        <LocaleSwitcher currentLocale={locale} slug={slug} labelKey="locale_switcher" />
      </div>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ color: "var(--cds-text-primary)" }}
      />
    </main>
  );
}

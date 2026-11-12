import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BackLink } from "@/components/BackLink";
import { listReplayIds, loadReplay } from "@/lib/replays";

export default async function ReplayIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("replay");
  const nav = await getTranslations("nav");
  const items = listReplayIds()
    .map((id) => loadReplay(id))
    .filter((r): r is NonNullable<typeof r> => r !== null);
  // Variants are reached from their parent replay, not listed on their own.
  const variantIds = new Set(items.flatMap((r) => (r.whatIf ? [r.whatIf] : [])));
  const main = items.filter((r) => !variantIds.has(r.id));
  const tItems = await getTranslations("replays");
  return (
    <main style={{ padding: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
      <BackLink href={`/${locale}`} label={nav("home")} />
      <h1>{t("index_title")}</h1>
      <p>{t("index_body")}</p>
      <ul>
        {main.map((r) => (
          <li key={r.id}>
            <Link href={`/${locale}/replay/${r.id}`}>{tItems(`${r.id}.title`)}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

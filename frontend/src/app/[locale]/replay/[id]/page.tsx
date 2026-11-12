import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BackLink } from "@/components/BackLink";
import { ReplayPlayer } from "@/components/ReplayPlayer";
import { loadReplay } from "@/lib/replays";

// next-intl's getTranslations reads request headers, which cannot happen during
// static generation for this route, so render per request.
export const dynamic = "force-dynamic";

export default async function ReplayPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const replay = loadReplay(id);
  if (!replay) notFound();
  const variant = replay.whatIf ? (loadReplay(replay.whatIf) ?? undefined) : undefined;
  const nav = await getTranslations("nav");
  return (
    <main style={{ padding: "1rem" }}>
      <BackLink href={`/${locale}/replay`} label={nav("replays")} />
      <ReplayPlayer replay={replay} variant={variant} />
    </main>
  );
}

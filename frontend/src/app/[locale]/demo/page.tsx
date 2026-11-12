import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import SlideShow from "@/components/SlideShow";
import type { Slide } from "@/components/SlideShow";
import Link from "next/link";
import { Button } from "@carbon/react";
import type { AnimationName } from "@/lib/animations";
import { WhyBobModal } from "@/components/WhyBobModal";

/**
 * Slide structure (order + animation). All copy lives in
 * `messages/{locale}.json` under `slides.<id>.title` / `slides.<id>.body`.
 */
const SLIDES: ReadonlyArray<{ id: string; animation?: AnimationName }> = [
  { id: "intro" },
  { id: "arc" },
  { id: "meet_bob", animation: "agenticLoop" },
  { id: "qubit", animation: "qubit" },
  { id: "superposition", animation: "superposition" },
  { id: "measurement", animation: "resultsHistogram" },
  { id: "entanglement", animation: "entanglement" },
  { id: "gates", animation: "gates" },
  { id: "ask_bob" },
  { id: "run_read", animation: "resultsHistogram" },
  { id: "classical_parity", animation: "classicalParity" },
  { id: "quantum_parity", animation: "quantumParity" },
  { id: "sim_vs_qpu" },
  { id: "oracle_search", animation: "amplitudeAmplification" },
  { id: "sat_oracle" },
  { id: "live_demo" },
];

export default async function DemoPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("slides");
  const tDemo = await getTranslations("demo");

  const slides: Slide[] = SLIDES.map(({ id, animation }) => ({
    title: t(`${id}.title`),
    body: t(`${id}.body`),
    animation,
    component:
      id === "live_demo" ? (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "1.5rem" }}>
          <Button as={Link} href={`/${locale}/replay`} size="lg">
            {tDemo("open_replays")}
          </Button>
          <Button as={Link} href={`/${locale}/lab`} size="lg" kind="tertiary">
            {tDemo("open_lab")}
          </Button>
        </div>
      ) : id === "meet_bob" ? (
        <WhyBobModal />
      ) : undefined,
  }));

  return (
    <Suspense>
      <SlideShow slides={slides} />
    </Suspense>
  );
}

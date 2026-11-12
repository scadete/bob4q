import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@carbon/react";
import { BackLink } from "@/components/BackLink";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MAIN_REPLAY_IDS } from "@/lib/replay-ids";

export const dynamic = "force-dynamic";

const PROMPTS = [
  "/qiskit-beginner-circuit a coin that lands heads or tails with equal chance",
  "Explain what examples/bell.py does, gate by gate, for a complete beginner. Use the Qiskit documentation to check each gate, and link the docs page you used for each one. Do not edit any file.",
  "/migrate-qiskit-ibm-runtime Migrate examples/deutsch_jozsa_qiskit1x.py to the latest Qiskit release. Then run it.",
  "examples/dj_sim.py runs Deutsch-Jozsa on a local simulator. Adapt it to run on a real IBM quantum computer with qiskit-ibm-runtime. Use the Qiskit documentation to check the current API. Read the API token only from the environment variable QISKIT_IBM_TOKEN, never write it to a file or print it; use job mode, no sessions; transpile with generate_preset_pass_manager; keep 1024 shots. Save the result as dj_qpu.py, run it, and print the simulator and QPU counts side by side.",
] as const;

const SETUP_COMMANDS = [
  "npm install -g @ibm/bob",
  "export BOB_API_KEY=...   # your own key; never put it in a file or a prompt",
  "unzip bob4q-kit.zip -d bob4q-kit && cd bob4q-kit",
  'bob run --trust --accept-license "<prompt>"   # or: bob chat',
] as const;

const preStyle = {
  background: "var(--cds-layer-01)",
  padding: "0.75rem 1rem",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  fontSize: "0.875rem",
  margin: "0 0 0.5rem",
} as const;

export default async function AtHomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("athome");
  const nav = await getTranslations("nav");
  const trep = await getTranslations("replays");
  const needs = ["need_account", "need_runtime", "need_qpu"] as const;
  return (
    <main style={{ padding: "1rem", maxWidth: "52rem", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BackLink href={`/${locale}`} label={nav("home")} />
        <LocaleSwitcher />
      </div>
      <h1>{t("title")}</h1>
      <p>{t("intro")}</p>
      <p>
        <Button as="a" href="/kit/bob4q-kit.zip" download size="lg">
          {t("download")}
        </Button>
      </p>
      <p style={{ color: "var(--cds-text-secondary)", fontSize: "0.875rem" }}>{t("download_note")}</p>

      <h2>{t("needs_title")}</h2>
      <ul>
        {needs.map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ul>

      <h2>{t("setup_title")}</h2>
      <pre style={preStyle}>{SETUP_COMMANDS.join("\n")}</pre>

      <h2>{t("prompts_title")}</h2>
      <ol style={{ paddingLeft: "1.25rem" }}>
        {PROMPTS.map((prompt, i) => (
          <li key={i} style={{ marginBottom: "1rem" }}>
            <strong>{trep(`${MAIN_REPLAY_IDS[i]}.title`)}</strong>
            <pre style={{ ...preStyle, marginTop: "0.5rem" }}>{prompt}</pre>
            <Link href={`/${locale}/replay/${MAIN_REPLAY_IDS[i]}`}>{t("see_replay")}</Link>
          </li>
        ))}
      </ol>

      <h2>{t("expect_title")}</h2>
      <p>{t("expect_body")}</p>
    </main>
  );
}

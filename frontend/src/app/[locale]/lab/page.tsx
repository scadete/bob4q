"use client";

import { useTranslations } from "next-intl";
import { Button } from "@carbon/react";
import dynamic from "next/dynamic";
import { useState } from "react";

// No SSR — LabEmbed uses window/iframe which don't exist on the server
const LabEmbed = dynamic(
  () => import("@/components/LabEmbed").then((m) => ({ default: m.LabEmbed })),
  { ssr: false }
);

export default function LabPage() {
  const t = useTranslations("lab");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleRunOnQpu() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/circuit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "", backend: "ibmq_qasm_simulator" }),
      });
      const data = (await res.json()) as { job_id: string; status: string };
      setResult(`Job ${data.job_id} — ${data.status}`);
    } catch {
      setResult("Error contacting backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid var(--cds-border-subtle)",
          background: "var(--cds-background)",
          flexShrink: 0,
        }}
      >
        <span
          style={{ fontWeight: 600, fontSize: "1rem", color: "var(--cds-text-primary)" }}
        >
          {t("title")}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {result && (
            <span style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
              {t("result")}: {result}
            </span>
          )}
          <Button size="sm" onClick={handleRunOnQpu} disabled={loading}>
            {loading ? t("running") : t("run_on_qpu")}
          </Button>
        </div>
      </div>

      {/* JupyterLite embedded via LabEmbed (no SSR) */}
      <LabEmbed notebookPath="01-quantum-fundamentals.ipynb" />
    </main>
  );
}

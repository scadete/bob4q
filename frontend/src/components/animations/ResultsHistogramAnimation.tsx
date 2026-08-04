"use client";

import { useEffect, useRef } from "react";

/**
 * ANIM-05 — Results histogram.
 *
 * The measurement-and-tally half of SuperpositionAnimation.tsx, lifted out
 * on its own (no Bloch sphere) so the same "many shots → convergent
 * histogram" visual can stand in for S6 (measurement & statistics) and S10
 * (reading the backend's counts after running a circuit).
 *
 * Honors `prefers-reduced-motion`: static converged 50/50 frame, no ticking.
 */

const SHOT_MS = 900;
const RESET_N = 40;

export function ResultsHistogramAnimation() {
  const digitRef = useRef<HTMLDivElement>(null);
  const fill0Ref = useRef<HTMLSpanElement>(null);
  const fill1Ref = useRef<HTMLSpanElement>(null);
  const txt0Ref = useRef<HTMLSpanElement>(null);
  const txt1Ref = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counts: [number, number] = [0, 0];
    const updateHist = () => {
      const total = counts[0] + counts[1];
      const p0 = total ? counts[0] / total : 0.5;
      if (fill0Ref.current) fill0Ref.current.style.width = `${p0 * 100}%`;
      if (fill1Ref.current) fill1Ref.current.style.width = `${(1 - p0) * 100}%`;
      if (txt0Ref.current) txt0Ref.current.textContent = `${counts[0]} · ${Math.round(p0 * 100)}%`;
      if (txt1Ref.current) txt1Ref.current.textContent = `${counts[1]} · ${Math.round((1 - p0) * 100)}%`;
      if (totalRef.current) totalRef.current.textContent = `${total} shot${total === 1 ? "" : "s"}`;
    };

    const setDigit = (outcome: 0 | 1 | null) => {
      if (!digitRef.current) return;
      digitRef.current.textContent = outcome === null ? "?" : String(outcome);
      digitRef.current.style.transform = outcome === null ? "scale(1)" : "scale(1.15)";
      digitRef.current.style.opacity = outcome === null ? "0.5" : "1";
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      counts[0] = 20;
      counts[1] = 20;
      updateHist();
      setDigit(null);
    } else {
      updateHist();
      setDigit(null);
      let shotStart = performance.now();
      let outcome: 0 | 1 | null = null;
      const frame = (now: number) => {
        if (now - shotStart >= SHOT_MS) {
          shotStart = now;
          outcome = null;
          if (counts[0] + counts[1] >= RESET_N) {
            counts[0] = 0;
            counts[1] = 0;
          }
        }
        const phase = (now - shotStart) / SHOT_MS;
        if (phase < 0.55) {
          setDigit(null);
        } else if (outcome === null) {
          outcome = Math.random() < 0.5 ? 0 : 1;
          counts[outcome] += 1;
          updateHist();
          setDigit(outcome);
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageSize = "min(340px, 84vw)";
  return (
    <div
      role="img"
      aria-label="A stream of measurement shots each collapsing to 0 or 1, tallied into a histogram that converges to 50/50"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--cds-text-primary)" }}
    >
      <div
        ref={digitRef}
        aria-hidden="true"
        style={{
          width: "4.5rem",
          height: "4.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: "2px solid var(--cds-border-interactive, #4589ff)",
          background: "var(--cds-layer-01, #262626)",
          fontSize: "2rem",
          fontFamily: "'IBM Plex Mono', monospace",
          transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
        }}
      >
        ?
      </div>

      <div style={{ width: stageSize, textAlign: "center", fontSize: "0.9rem", color: "var(--cds-text-secondary)" }}>
        Each shot collapses to a classical outcome — repeat many times to read the statistics
      </div>

      <div style={{ width: stageSize, display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", color: "var(--cds-text-secondary)" }}>
        {(
          [
            ["0", fill0Ref, txt0Ref, "var(--cds-support-info)"],
            ["1", fill1Ref, txt1Ref, "var(--cds-support-error)"],
          ] as const
        ).map(([label, fillRef, txtRef, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "1.4rem", fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
            <span style={{ flex: 1, height: "10px", background: "var(--cds-layer-02, #393939)", borderRadius: "2px", overflow: "hidden", display: "block" }}>
              <span ref={fillRef} style={{ display: "block", height: "100%", width: "50%", background: color }} />
            </span>
            <span ref={txtRef} style={{ width: "4.2rem", textAlign: "right" }}>0 · 50%</span>
          </div>
        ))}
        <div ref={totalRef} style={{ textAlign: "center", color: "var(--cds-text-helper, #8d8d8d)" }}>0 shots</div>
      </div>
    </div>
  );
}

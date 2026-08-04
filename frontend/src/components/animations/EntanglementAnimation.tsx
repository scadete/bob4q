"use client";

import { useEffect, useRef } from "react";
import { drawCNOT, drawGateBox, drawMeterBox, drawPlayhead, drawWire, readCircuitColors } from "./circuit";

/**
 * ANIM-03 — Entanglement / Bell state.
 *
 * Reference: manim/scenes/entanglement.py. A persistent two-qubit circuit
 * (H on q0, then CNOT, then measurement) with a vertical execution "playhead"
 * that sweeps left→right: as it passes H, q0 enters superposition; as it passes
 * CNOT, the two qubits entangle (|Φ⁺⟩); reaching the meters triggers a
 * correlated measurement. Outcomes are always 00 or 11 — never 01/10 — shown by
 * a four-bar histogram where only 00 and 11 ever fill.
 *
 * Not a Bloch sphere: an entangled qubit alone is maximally mixed, so this
 * shows the correlation, not single-qubit arrows.
 *
 * Honors `prefers-reduced-motion`: static post-measurement frame + histogram.
 */

const SHOT_MS = 2600;
const P_EXEC = 0.58; // playhead reaches the meters (measurement) at this phase
const H_P = 0.3; // H gate position along the sweep (0..1)
const CNOT_P = 0.62; // CNOT position along the sweep
const RESET_N = 40;
const OUTCOMES = ["00", "01", "10", "11"] as const;

export function EntanglementAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const histRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = readCircuitColors(canvas);

    let W = 0, H = 0;
    const setup = () => {
      W = stage.clientWidth;
      H = Math.round(W * 0.5);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const counts: Record<string, number> = { "00": 0, "01": 0, "10": 0, "11": 0 };
    const updateHist = () => {
      const total = counts["00"] + counts["01"] + counts["10"] + counts["11"];
      const hist = histRef.current;
      if (hist) {
        for (const key of OUTCOMES) {
          const fill = hist.querySelector<HTMLElement>(`[data-fill="${key}"]`);
          const txt = hist.querySelector<HTMLElement>(`[data-txt="${key}"]`);
          const p = total ? counts[key] / total : 0;
          if (fill) fill.style.width = `${p * 100}%`;
          if (txt) txt.textContent = `${counts[key]} · ${Math.round(p * 100)}%`;
        }
      }
      if (totalRef.current) totalRef.current.textContent = `${total} measurement${total === 1 ? "" : "s"}`;
    };

    interface Beat {
      playProg: number; // 0..1 across the circuit; <0 hides the playhead
      playAlpha: number;
      superposed: boolean;
      entangled: boolean;
      outcome: "0" | "1" | null;
      flash: number;
    }

    const draw = (bt: Beat) => {
      ctx.clearRect(0, 0, W, H);
      const wy0 = H * 0.4;
      const wy1 = H * 0.72;
      const sx0 = W * 0.16; // sweep start (also wire start after labels)
      const sx1 = W * 0.8; // sweep end = meter x
      const wireEnd = W * 0.92;
      const prog2x = (p: number) => sx0 + (sx1 - sx0) * p;
      const hx = prog2x(H_P);
      const cx = prog2x(CNOT_P);
      const r = Math.max(9, W * 0.028);
      const box = Math.max(20, W * 0.07);

      // Base wires.
      for (const wy of [wy0, wy1]) drawWire(ctx, W * 0.1, wireEnd, wy, colors.wire);

      // State overlay: q0 superposed after H; both entangled after CNOT.
      ctx.strokeStyle = colors.state;
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = 0.85;
      if (bt.superposed) {
        ctx.beginPath();
        ctx.moveTo(hx, wy0);
        ctx.lineTo(bt.entangled ? cx : wireEnd, wy0);
        ctx.stroke();
      }
      if (bt.entangled) {
        for (const wy of [wy0, wy1]) {
          ctx.beginPath();
          ctx.moveTo(cx, wy);
          ctx.lineTo(wireEnd, wy);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // |0⟩ input labels.
      ctx.fillStyle = colors.textDim;
      ctx.font = `${Math.round(r * 1.5)}px 'IBM Plex Sans', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("|0⟩", W * 0.06, wy0);
      ctx.fillText("|0⟩", W * 0.06, wy1);

      // H gate box on q0.
      drawGateBox(ctx, hx, wy0, "H", box, colors);

      // CNOT: control dot on q0, line to target ⊕ on q1.
      drawCNOT(ctx, cx, wy0, wy1, r, colors.gate);

      // |Φ⁺⟩ label once entangled.
      if (bt.entangled) {
        ctx.fillStyle = colors.state;
        ctx.font = `${Math.round(r * 1.4)}px 'IBM Plex Sans', system-ui, sans-serif`;
        ctx.fillText("|Φ⁺⟩", (cx + sx1) / 2, wy0 - box * 0.9);
      }

      // Measurement meters (show the outcome digit once measured).
      for (const wy of [wy0, wy1]) drawMeterBox(ctx, sx1, wy, box, colors, bt.outcome);

      // Correlation bond between the two results (glows on measurement).
      if (bt.outcome) {
        ctx.save();
        ctx.strokeStyle = colors.state;
        ctx.lineWidth = 2 + bt.flash * 2;
        ctx.globalAlpha = 0.4 + bt.flash * 0.5;
        ctx.shadowColor = colors.state;
        ctx.shadowBlur = 8 + bt.flash * 20;
        ctx.beginPath();
        ctx.moveTo(sx1 + box * 0.5, wy0);
        ctx.lineTo(sx1 + box * 0.5, wy1);
        ctx.stroke();
        ctx.restore();
      }

      // Execution playhead.
      if (bt.playProg >= 0) {
        const px = prog2x(bt.playProg);
        drawPlayhead(ctx, px, wy0 - box * 0.8, wy1 + box * 0.8, colors.play, bt.playAlpha);
      }
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      counts["00"] = 20;
      counts["11"] = 20;
      updateHist();
      draw({ playProg: -1, playAlpha: 0, superposed: true, entangled: true, outcome: "0", flash: 0 });
    } else {
      updateHist();
      let shotStart = performance.now();
      let outcome: "0" | "1" | null = null;
      const frame = (now: number) => {
        if (now - shotStart >= SHOT_MS) {
          shotStart = now;
          outcome = null;
          const total = counts["00"] + counts["01"] + counts["10"] + counts["11"];
          if (total >= RESET_N) OUTCOMES.forEach((k) => (counts[k] = 0));
        }
        const p = (now - shotStart) / SHOT_MS;
        let bt: Beat;
        if (p < P_EXEC) {
          const prog = p / P_EXEC;
          bt = { playProg: prog, playAlpha: 1, superposed: prog >= H_P, entangled: prog >= CNOT_P, outcome: null, flash: 0 };
        } else {
          if (outcome === null) {
            outcome = Math.random() < 0.5 ? "0" : "1";
            counts[outcome + outcome] += 1; // Bell state → 00 or 11 only
            updateHist();
          }
          const flash = Math.max(0, 1 - (p - P_EXEC) / 0.16);
          bt = { playProg: 1, playAlpha: Math.max(0, 1 - (p - P_EXEC) / 0.1), superposed: true, entangled: true, outcome, flash };
        }
        draw(bt);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      setup();
      if (reduce) draw({ playProg: -1, playAlpha: 0, superposed: true, entangled: true, outcome: "0", flash: 0 });
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageSize = "min(380px, 88vw)";
  const monoLabel = { width: "2.4rem", fontFamily: "'IBM Plex Mono', monospace" } as const;
  return (
    <div
      role="img"
      aria-label="A two-qubit circuit — H on q0 then CNOT — executed by a moving playhead to build the Bell state, then measured; outcomes are always correlated (00 or 11), shown by a histogram where only 00 and 11 fill"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>

      <div style={{ width: stageSize, textAlign: "center", fontSize: "0.9rem", color: "var(--cds-text-secondary)" }}>
        |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 — always correlated: 00 or 11, never 01 or 10
      </div>

      <div ref={histRef} style={{ width: stageSize, display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.8rem", color: "var(--cds-text-secondary)" }}>
        {OUTCOMES.map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={monoLabel}>|{key}⟩</span>
            <span style={{ flex: 1, height: "10px", background: "var(--cds-layer-02, #393939)", borderRadius: "2px", overflow: "hidden", display: "block" }}>
              <span data-fill={key} style={{ display: "block", height: "100%", width: "0%", background: key === "00" || key === "11" ? "var(--cds-support-info)" : "var(--cds-support-error)" }} />
            </span>
            <span data-txt={key} style={{ width: "4.2rem", textAlign: "right" }}>0 · 0%</span>
          </div>
        ))}
        <div ref={totalRef} style={{ textAlign: "center", color: "var(--cds-text-helper, #8d8d8d)" }}>0 measurements</div>
      </div>
    </div>
  );
}

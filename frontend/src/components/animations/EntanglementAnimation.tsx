"use client";

import { useEffect, useRef } from "react";

/**
 * ANIM-03 — Entanglement / Bell state.
 *
 * Reference: manim/scenes/entanglement.py. Two qubits: H on A, then CNOT →
 * the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Measuring A instantly determines B —
 * outcomes are always correlated (00 or 11, never 01 or 10), shown by a
 * four-bar histogram where only 00 and 11 ever fill.
 *
 * Deliberately NOT a Bloch sphere: each entangled qubit alone is maximally
 * mixed (a dot at the centre), so entanglement is shown as the correlation
 * between two nodes, not as single-qubit arrows.
 *
 * Honors `prefers-reduced-motion`: static entangled-pair frame + a 00/11
 * histogram.
 */

type NodeState = "0" | "1" | "?";
interface Beat {
  a: NodeState;
  b: NodeState;
  bond: number; // 0 = none, 1 = fully entangled
  badge: string | null;
  flash: number; // measurement flash 0..1
  bell: boolean; // show the |Φ⁺⟩ label
}

const SHOT_MS = 2600;
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

    const cs = getComputedStyle(canvas);
    const tok = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    const colors = {
      node: tok("--cds-layer-01", "#262626"),
      text: tok("--cds-text-primary", "#f4f4f4"),
      textDim: tok("--cds-text-secondary", "#c6c6c6"),
      badgeBg: tok("--cds-layer-01", "#262626"),
      accent: tok("--cds-border-interactive", "#4589ff"),
      a: tok("--cds-support-info", "#4589ff"),
      b: tok("--cds-support-error", "#fa4d56"),
      bond: tok("--cds-support-warning", "#f1c21b"),
    };

    let W = 0, H = 0;
    const setup = () => {
      W = stage.clientWidth;
      H = Math.round(W * 0.58);
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

    const drawNode = (x: number, y: number, r: number, label: NodeState, ring: string) => {
      ctx.fillStyle = colors.node;
      ctx.strokeStyle = ring;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = label === "?" ? 0.9 : 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = label === "?" ? colors.textDim : colors.text;
      ctx.font = `bold ${label === "?" ? Math.round(r * 0.9) : Math.round(r * 1.1)}px 'IBM Plex Sans', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y + 1);
    };

    const drawBadge = (letter: string) => {
      const s = 26, x = W / 2 - s / 2, y = 6;
      ctx.fillStyle = colors.badgeBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(x, y, s, s);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.text;
      ctx.font = "bold 15px 'IBM Plex Sans', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, W / 2, y + s / 2 + 1);
    };

    const draw = (bt: Beat) => {
      ctx.clearRect(0, 0, W, H);
      const r = W * 0.13;
      const ay = H * 0.55;
      const ax = W * 0.24;
      const bx = W * 0.76;

      // Entanglement bond (grows with bt.bond; brightens on measurement flash).
      if (bt.bond > 0) {
        ctx.save();
        ctx.strokeStyle = colors.bond;
        ctx.lineWidth = 2 + bt.flash * 2;
        ctx.globalAlpha = 0.35 + bt.bond * 0.4 + bt.flash * 0.25;
        ctx.shadowColor = colors.bond;
        ctx.shadowBlur = 6 + bt.bond * 8 + bt.flash * 18;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(ax + r, ay);
        ctx.lineTo(ax + r + (bx - r - (ax + r)) * bt.bond, ay);
        ctx.stroke();
        ctx.restore();
        if (bt.bell) {
          ctx.fillStyle = colors.bond;
          ctx.font = "14px 'IBM Plex Sans', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("|Φ⁺⟩", W / 2, ay - r - 14);
        }
      }

      // Measurement flash rings.
      if (bt.flash > 0) {
        for (const x of [ax, bx]) {
          ctx.strokeStyle = x === ax ? colors.a : colors.b;
          ctx.globalAlpha = bt.flash * 0.7;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, ay, r + 6 + (1 - bt.flash) * 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      drawNode(ax, ay, r, bt.a, colors.a);
      drawNode(bx, ay, r, bt.b, colors.b);
      ctx.fillStyle = colors.textDim;
      ctx.font = "12px 'IBM Plex Sans', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("A", ax, ay + r + 16);
      ctx.fillText("B", bx, ay + r + 16);

      if (bt.badge) drawBadge(bt.badge);
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      counts["00"] = 20;
      counts["11"] = 20;
      updateHist();
      draw({ a: "?", b: "?", bond: 1, badge: null, flash: 0, bell: true });
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
        if (p < 0.08) {
          bt = { a: "0", b: "0", bond: 0, badge: null, flash: 0, bell: false };
        } else if (p < 0.26) {
          bt = { a: "?", b: "0", bond: 0, badge: "H", flash: 0, bell: false }; // H on A
        } else if (p < 0.3) {
          bt = { a: "?", b: "0", bond: 0, badge: null, flash: 0, bell: false };
        } else if (p < 0.5) {
          const prog = (p - 0.3) / 0.2; // CNOT: bond grows, B entangles
          bt = { a: "?", b: prog > 0.6 ? "?" : "0", bond: prog, badge: "⊕", flash: 0, bell: prog > 0.9 };
        } else if (p < 0.6) {
          bt = { a: "?", b: "?", bond: 1, badge: null, flash: 0, bell: true }; // entangled hold
        } else {
          if (outcome === null) {
            outcome = Math.random() < 0.5 ? "0" : "1";
            counts[outcome + outcome] += 1; // Bell state → 00 or 11 only
            updateHist();
          }
          const flash = Math.max(0, 1 - (p - 0.6) / 0.14);
          bt = { a: outcome, b: outcome, bond: 1, badge: flash > 0.1 ? "M" : null, flash, bell: false };
        }
        draw(bt);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      setup();
      if (reduce) draw({ a: "?", b: "?", bond: 1, badge: null, flash: 0, bell: true });
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageSize = "min(360px, 86vw)";
  const monoLabel = { width: "2.4rem", fontFamily: "'IBM Plex Mono', monospace" } as const;
  return (
    <div
      role="img"
      aria-label="Two qubits put into the Bell state with H then CNOT, then measured repeatedly; outcomes are always correlated (00 or 11), shown by a histogram where only 00 and 11 fill"
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

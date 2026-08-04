"use client";

import { useEffect, useRef } from "react";
import { drawCNOT, drawGateBox, drawMeterBox, drawWire, readCircuitColors } from "./circuit";

/**
 * S8 — Gates & circuits vocabulary.
 *
 * A static two-qubit circuit (X, H, CNOT, measure) with a highlight ring that
 * cycles through each gate while a caption names it — teaches the vocabulary
 * needed to read a circuit diagram before Bob builds one live (S9).
 *
 * Honors `prefers-reduced-motion`: draws the same circuit with no cycling
 * highlight, plus a static legend listing all four gates.
 */

interface GateSpot {
  t: number; // x-position along the sweep (0..1)
  kind: "gate" | "cnot" | "measure";
  label?: string;
  name: string;
  caption: string;
}

const GATES: GateSpot[] = [
  { t: 0.24, kind: "gate", label: "X", name: "X gate", caption: "X — flips |0⟩ ↔ |1⟩ (the quantum bit-flip)" },
  { t: 0.44, kind: "gate", label: "H", name: "H gate", caption: "H — Hadamard, creates superposition" },
  { t: 0.64, kind: "cnot", name: "CNOT", caption: "CNOT — entangles two qubits" },
  { t: 0.84, kind: "measure", name: "Measure", caption: "Measure — collapses a qubit to a classical bit" },
];
const GATE_MS = 2000;

export function GatesAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

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

    const drawHighlight = (x: number, y0: number, y1: number, box: number, glow: number) => {
      ctx.save();
      ctx.strokeStyle = colors.state;
      ctx.globalAlpha = 0.35 + glow * 0.5;
      ctx.lineWidth = 2 + glow * 1.5;
      ctx.shadowColor = colors.state;
      ctx.shadowBlur = 6 + glow * 14;
      ctx.beginPath();
      ctx.roundRect(x - box * 0.85, y0 - box * 0.85, box * 1.7, y1 - y0 + box * 1.7, 8);
      ctx.stroke();
      ctx.restore();
    };

    const draw = (activeIndex: number, glow: number) => {
      ctx.clearRect(0, 0, W, H);
      const wy0 = H * 0.4;
      const wy1 = H * 0.72;
      const sx0 = W * 0.14;
      const sx1 = W * 0.94;
      const prog2x = (p: number) => sx0 + (sx1 - sx0) * p;
      const r = Math.max(9, W * 0.028);
      const box = Math.max(20, W * 0.07);

      for (const wy of [wy0, wy1]) drawWire(ctx, sx0 - W * 0.04, sx1, wy, colors.wire);

      ctx.fillStyle = colors.textDim;
      ctx.font = `${Math.round(r * 1.5)}px 'IBM Plex Sans', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("|0⟩", sx0 - W * 0.08, wy0);
      ctx.fillText("|0⟩", sx0 - W * 0.08, wy1);

      GATES.forEach((g, i) => {
        const x = prog2x(g.t);
        if (g.kind === "gate") drawGateBox(ctx, x, wy0, g.label!, box, colors);
        else if (g.kind === "cnot") drawCNOT(ctx, x, wy0, wy1, r, colors.gate);
        else {
          drawMeterBox(ctx, x, wy0, box, colors, null);
          drawMeterBox(ctx, x, wy1, box, colors, null);
        }
        if (i === activeIndex) {
          const y0 = g.kind === "gate" ? wy0 : wy0;
          const y1 = g.kind === "gate" ? wy0 : wy1;
          drawHighlight(x, y0, y1, box, glow);
        }
      });
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      draw(-1, 0);
      if (captionRef.current) captionRef.current.textContent = "";
    } else {
      const period = GATE_MS * GATES.length;
      const start = performance.now();
      let lastCaption = "";
      const frame = (now: number) => {
        const t = ((now - start) % period + period) % period;
        const idx = Math.min(GATES.length - 1, Math.floor(t / GATE_MS));
        const local = (t - idx * GATE_MS) / GATE_MS;
        const glow = Math.sin(Math.min(1, local * 3) * Math.PI * 0.5) * (local < 0.85 ? 1 : Math.max(0, 1 - (local - 0.85) / 0.15));
        draw(idx, glow);
        const caption = GATES[idx].caption;
        if (captionRef.current && caption !== lastCaption) {
          captionRef.current.textContent = caption;
          lastCaption = caption;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      setup();
      if (reduce) draw(-1, 0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageSize = "min(420px, 90vw)";
  return (
    <div
      role="img"
      aria-label="A two-qubit circuit diagram naming its parts: an X gate, an H gate, a CNOT, and measurement meters"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>

      <div
        ref={captionRef}
        aria-hidden="true"
        style={{ height: "1.4rem", width: stageSize, textAlign: "center", fontSize: "0.9rem", color: "var(--cds-text-secondary)" }}
      />

      <ul
        style={{
          width: stageSize,
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
          fontSize: "0.85rem",
          color: "var(--cds-text-secondary)",
          textAlign: "left",
        }}
      >
        {GATES.map((g) => (
          <li key={g.name}>{g.caption}</li>
        ))}
      </ul>
    </div>
  );
}

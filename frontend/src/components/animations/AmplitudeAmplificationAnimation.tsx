"use client";

import { useEffect, useRef } from "react";

/**
 * ANIM-07 — Grover amplitude amplification.
 *
 * 8 basis states (N=8), one marked. Each Grover iteration is oracle
 * (phase-flip the marked amplitude) then diffusion (reflect every amplitude
 * about the mean) — the marked bar grows while the rest shrink. Real Grover
 * math (not a canned illustration): ~π/4·√N ≈ 2 iterations peaks the marked
 * amplitude near 1.
 *
 * Honors `prefers-reduced-motion`: static post-iteration-2 frame.
 */

const N = 8;
const MARKED = 3;

function oracleFlip(a: number[]): number[] {
  return a.map((v, i) => (i === MARKED ? -v : v));
}
function diffuse(a: number[]): number[] {
  const mean = a.reduce((s, v) => s + v, 0) / a.length;
  return a.map((v) => 2 * mean - v);
}
const smoothstep = (u: number) => u * u * (3 - 2 * u);
const lerpArr = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

const s0 = Array.from({ length: N }, () => 1 / Math.sqrt(N));
const afterOracle1 = oracleFlip(s0);
const s1 = diffuse(afterOracle1);
const afterOracle2 = oracleFlip(s1);
const s2 = diffuse(afterOracle2);

interface Segment {
  dur: number;
  from: number[];
  to: number[];
  label: string;
  iteration: number;
}

const SEGMENTS: Segment[] = [
  { dur: 900, from: s0, to: s0, label: "Uniform superposition — 1/√N amplitude on every state", iteration: 0 },
  { dur: 500, from: s0, to: afterOracle1, label: "Oracle flips the marked amplitude's phase", iteration: 1 },
  { dur: 700, from: afterOracle1, to: s1, label: "Diffusion reflects every amplitude about the mean", iteration: 1 },
  { dur: 700, from: s1, to: s1, label: "After iteration 1 of ~2", iteration: 1 },
  { dur: 500, from: s1, to: afterOracle2, label: "Oracle flips the marked amplitude's phase", iteration: 2 },
  { dur: 700, from: afterOracle2, to: s2, label: "Diffusion reflects every amplitude about the mean", iteration: 2 },
  { dur: 1400, from: s2, to: s2, label: "After iteration 2 of ~2 — the marked state stands out", iteration: 2 },
];
const PERIOD_MS = SEGMENTS.reduce((s, seg) => s + seg.dur, 0);
const MAX_ABS = Math.max(...[s0, afterOracle1, s1, afterOracle2, s2].flat().map(Math.abs));

export function AmplitudeAmplificationAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const iterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(canvas);
    const tok = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    const colors = {
      wire: tok("--cds-border-subtle", "#525252"),
      text: tok("--cds-text-primary", "#f4f4f4"),
      textDim: tok("--cds-text-secondary", "#c6c6c6"),
      bar: tok("--cds-border-interactive", "#4589ff"),
      marked: tok("--cds-support-warning", "#f1c21b"),
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

    const draw = (amps: number[]) => {
      ctx.clearRect(0, 0, W, H);
      const baseline = H * 0.55;
      const usable = W * 0.86;
      const barGap = usable / N;
      const barW = barGap * 0.6;
      const maxBarH = H * 0.42;
      const x0 = W * 0.07;

      ctx.strokeStyle = colors.wire;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(x0 - W * 0.02, baseline);
      ctx.lineTo(x0 + usable + W * 0.02, baseline);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.font = `${Math.round(W * 0.024)}px 'IBM Plex Mono', monospace`;
      ctx.textAlign = "center";
      for (let i = 0; i < N; i++) {
        const cx = x0 + barGap * (i + 0.5);
        const amp = amps[i];
        const barH = (Math.abs(amp) / MAX_ABS) * maxBarH;
        const isMarked = i === MARKED;
        ctx.fillStyle = isMarked ? colors.marked : colors.bar;
        ctx.globalAlpha = isMarked ? 1 : 0.7;
        if (amp >= 0) {
          ctx.fillRect(cx - barW / 2, baseline - barH, barW, barH);
        } else {
          ctx.fillRect(cx - barW / 2, baseline, barW, barH);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = colors.textDim;
        ctx.textBaseline = "top";
        ctx.fillText(i.toString(2).padStart(3, "0"), cx, baseline + maxBarH * 0.55 + 4);
      }

      ctx.fillStyle = colors.marked;
      ctx.font = `bold ${Math.round(W * 0.026)}px 'IBM Plex Sans', system-ui, sans-serif`;
      ctx.textBaseline = "bottom";
      const markedCx = x0 + barGap * (MARKED + 0.5);
      ctx.fillText("marked", markedCx, baseline - maxBarH - 6);
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      draw(s2);
      if (captionRef.current) captionRef.current.textContent = "After iteration 2 of ~2 — the marked state stands out";
      if (iterRef.current) iterRef.current.textContent = "Iterations: ~π/4·√N ≈ 2 (N = 8)";
    } else {
      const start = performance.now();
      let lastLabel = "";
      const frame = (now: number) => {
        const t = ((now - start) % PERIOD_MS + PERIOD_MS) % PERIOD_MS;
        let acc = 0;
        let seg = SEGMENTS[0];
        let local = 0;
        for (const s of SEGMENTS) {
          if (t < acc + s.dur) {
            seg = s;
            local = (t - acc) / s.dur;
            break;
          }
          acc += s.dur;
        }
        const amps = lerpArr(seg.from, seg.to, smoothstep(local));
        draw(amps);
        if (captionRef.current && seg.label !== lastLabel) {
          captionRef.current.textContent = seg.label;
          lastLabel = seg.label;
        }
        if (iterRef.current) iterRef.current.textContent = `Iteration ${seg.iteration} of ~2 (√N ≈ 2.8)`;
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      setup();
      if (reduce) draw(s2);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageSize = "min(560px, 94vw)";
  return (
    <div
      role="img"
      aria-label="A bar chart of 8 amplitudes where the marked state's bar grows via an oracle phase-flip and a diffusion reflection, over about 2 Grover iterations, while the other bars shrink"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>
      <div ref={iterRef} style={{ width: stageSize, textAlign: "center", fontSize: "0.85rem", color: "var(--cds-text-secondary)" }} />
      <div ref={captionRef} style={{ width: stageSize, textAlign: "center", fontSize: "0.9rem", color: "var(--cds-text-secondary)", minHeight: "1.3rem" }} />
    </div>
  );
}

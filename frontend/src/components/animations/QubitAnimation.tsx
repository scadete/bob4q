"use client";

import { useEffect, useRef } from "react";
import {
  apply,
  drawLabel,
  drawSphere,
  drawVector,
  makeCamera,
  mixColor,
  parseColor,
  rotAxis,
  type Camera,
  type Vec3,
} from "./bloch";

/**
 * ANIM-01 — Gates as Bloch-sphere rotations: H → Z → H.
 *
 * Rendered with a tiny custom 3D projection (see ./bloch). Each gate is the
 * real rotation of the 3D state vector:
 *   H = 180° about (X+Z)/√2 (a genuinely two-axis tilt, out of the screen plane)
 *   Z = 180° about the pole axis
 * Starting from |0⟩: H → |+⟩, Z → |−⟩, H → |1⟩. So H·Z·H = X (a bit flip).
 *
 * Honors `prefers-reduced-motion`: renders a static |+⟩ frame.
 */

// Bloch directions (X = right/|+⟩, Y = up/|0⟩ pole, Z = toward viewer).
const S0: Vec3 = [0, 1, 0]; // |0⟩
const SP: Vec3 = [1, 0, 0]; // |+⟩
const SM: Vec3 = [-1, 0, 0]; // |−⟩
const S1: Vec3 = [0, -1, 0]; // |1⟩
const H_AXIS: Vec3 = [1, 1, 0]; // (X+Z)/√2 in these coords → normalized in rotAxis
const Z_AXIS: Vec3 = [0, 1, 0]; // pole axis

type Seg =
  | { t0: number; t1: number; kind: "hold"; state: Vec3; caption: string }
  | { t0: number; t1: number; kind: "gate"; from: Vec3; axis: Vec3; angle: number; gate: string; caption: string };

const SEGMENTS: Seg[] = [
  { t0: 0.0, t1: 0.06, kind: "hold", state: S0, caption: "|0⟩ — start" },
  { t0: 0.06, t1: 0.24, kind: "gate", from: S0, axis: H_AXIS, angle: 180, gate: "H", caption: "H gate: |0⟩ → |+⟩" },
  { t0: 0.24, t1: 0.34, kind: "hold", state: SP, caption: "|+⟩ superposition" },
  { t0: 0.34, t1: 0.52, kind: "gate", from: SP, axis: Z_AXIS, angle: -180, gate: "Z", caption: "Z gate: |+⟩ → |−⟩" },
  { t0: 0.52, t1: 0.62, kind: "hold", state: SM, caption: "|−⟩" },
  { t0: 0.62, t1: 0.8, kind: "gate", from: SM, axis: H_AXIS, angle: 180, gate: "H", caption: "H gate: |−⟩ → |1⟩" },
  { t0: 0.8, t1: 1.0, kind: "hold", state: S1, caption: "H·Z·H = X  →  |1⟩" },
];
const STATIC_T = 0.28; // reduced-motion frame = |+⟩

const smoothstep = (u: number) => u * u * (3 - 2 * u);
const segAt = (t: number) => SEGMENTS.find((s) => t >= s.t0 && t < s.t1) ?? SEGMENTS[SEGMENTS.length - 1];

/** Loop-reset fade: fade in at the very start, fade out over the last stretch. */
function vectorAlpha(t: number): number {
  if (t < 0.05) return t / 0.05;
  if (t > 0.9) return Math.max(0, 1 - (t - 0.9) / 0.1);
  return 1;
}

export function QubitAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const p0FillRef = useRef<HTMLSpanElement>(null);
  const p0TxtRef = useRef<HTMLSpanElement>(null);
  const p1FillRef = useRef<HTMLSpanElement>(null);
  const p1TxtRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(canvas);
    const tok = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    const colors = {
      silhouette: tok("--cds-border-strong", "#8d8d8d"),
      wire: tok("--cds-border-subtle", "#525252"),
      fillInner: tok("--cds-layer-02", "#393939"),
      fillOuter: tok("--cds-background", "#161616"),
      text: tok("--cds-text-secondary", "#c6c6c6"),
      badge: tok("--cds-text-primary", "#f4f4f4"),
      badgeBg: tok("--cds-layer-01", "#262626"),
      accent: tok("--cds-border-interactive", "#4589ff"),
    };
    const red = parseColor(tok("--cds-support-error", "#fa4d56"), [250, 77, 86]);
    const yellow = parseColor(tok("--cds-support-warning", "#f1c21b"), [241, 194, 27]);
    const font = "13px 'IBM Plex Sans', system-ui, sans-serif";

    let cam: Camera;
    const setup = () => {
      const size = stage.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cam = makeCamera(-28, 16, size * 0.34, size / 2, size / 2);
    };

    const drawBadge = (letter: string, alpha: number) => {
      if (alpha <= 0) return;
      const w = 26, h = 26, x = cam.cx - w / 2, y = 8;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors.badgeBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.badge;
      ctx.font = "bold 15px 'IBM Plex Sans', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, cam.cx, y + h / 2 + 1);
      ctx.globalAlpha = 1;
    };

    let lastCaption = "";
    const setCaption = (text: string) => {
      if (captionRef.current && text !== lastCaption) {
        captionRef.current.textContent = text;
        lastCaption = text;
      }
    };

    const draw = (t: number) => {
      const size = cam.cx * 2;
      ctx.clearRect(0, 0, size, size);
      drawSphere(ctx, cam, colors);

      const seg = segAt(t);
      let dir: Vec3;
      if (seg.kind === "hold") {
        dir = seg.state;
      } else {
        const p = smoothstep((t - seg.t0) / (seg.t1 - seg.t0));
        dir = apply(rotAxis(seg.axis, seg.angle * p), seg.from);
      }

      const equatorness = 1 - Math.abs(dir[1]); // 0 at poles → 1 at equator
      drawVector(ctx, dir, cam, mixColor(red, yellow, equatorness), 2.5, vectorAlpha(t));

      // Live measurement probabilities: P(0) = (1 + pole·state)/2, pole = +Y.
      const p0 = Math.max(0, Math.min(1, (1 + dir[1]) / 2));
      if (p0FillRef.current) p0FillRef.current.style.width = `${p0 * 100}%`;
      if (p1FillRef.current) p1FillRef.current.style.width = `${(1 - p0) * 100}%`;
      if (p0TxtRef.current) p0TxtRef.current.textContent = `${Math.round(p0 * 100)}%`;
      if (p1TxtRef.current) p1TxtRef.current.textContent = `${Math.round((1 - p0) * 100)}%`;

      drawLabel(ctx, S0, cam, "|0⟩", colors.text, font);
      drawLabel(ctx, S1, cam, "|1⟩", colors.text, font);
      drawLabel(ctx, SP, cam, "|+⟩", colors.text, font);
      drawLabel(ctx, SM, cam, "|−⟩", colors.text, font);

      if (seg.kind === "gate") {
        const p = (t - seg.t0) / (seg.t1 - seg.t0);
        drawBadge(seg.gate, Math.min(1, Math.sin(p * Math.PI) * 1.6));
      }
      setCaption(seg.caption);
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduce) {
      draw(STATIC_T);
    } else {
      const period = 11000;
      const start = performance.now();
      const loop = (now: number) => {
        const t = ((((now - start) % period) + period) % period) / period;
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      setup();
      if (reduce) draw(STATIC_T);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageSize = "min(340px, 80vw)";
  return (
    <div
      role="img"
      aria-label="A qubit state vector on a 3D Bloch sphere: a Hadamard, then a Z gate, then a Hadamard (H·Z·H = X), taking |0⟩ to |1⟩"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize, aspectRatio: "1" }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>

      {/* Live measurement probabilities (update with the state each frame). */}
      <div style={{ width: stageSize, display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", color: "var(--cds-text-secondary)" }}>
        {(
          [
            ["P(|0⟩)", p0FillRef, p0TxtRef, "var(--cds-support-info)"],
            ["P(|1⟩)", p1FillRef, p1TxtRef, "var(--cds-support-error)"],
          ] as const
        ).map(([label, fillRef, txtRef, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "3rem" }}>{label}</span>
            <span style={{ flex: 1, height: "8px", background: "var(--cds-layer-02, #393939)", borderRadius: "2px", overflow: "hidden", display: "block" }}>
              <span ref={fillRef} style={{ display: "block", height: "100%", width: "50%", background: color }} />
            </span>
            <span ref={txtRef} style={{ width: "2.6rem", textAlign: "right" }}>50%</span>
          </div>
        ))}
      </div>

      <div
        ref={captionRef}
        aria-hidden="true"
        style={{ height: "1.4rem", width: stageSize, textAlign: "center", fontSize: "0.9rem", color: "var(--cds-text-secondary)" }}
      />
    </div>
  );
}

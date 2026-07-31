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
  rotZ,
  type Camera,
  type Vec3,
} from "./bloch";

/**
 * ANIM-01 — Qubit / Bloch sphere.
 *
 * CSS/JS reimplementation of manim/scenes/qubit.py (QubitScene), rendered with
 * a tiny custom 3D projection (see ./bloch). The state vector is a true 3D unit
 * vector; the Hadamard is one clean rotation of it (|0⟩ pole → |+⟩ equator),
 * followed by measurement collapse to |1⟩. The 3D look comes from a fixed
 * camera, so there is no coupled screen-axis motion.
 *
 * Honors `prefers-reduced-motion`: renders a static |+⟩ frame instead of
 * animating.
 */

// θ (deg) about the Z axis over one loop: |0⟩(0) → |+⟩(-90) → |1⟩(-180) → reset.
const THETA_KEYS: [number, number][] = [
  [0, 0], [0.1, 0], [0.3, -90], [0.48, -90], [0.66, -180], [0.84, -180], [1, -360],
];
const STATIC_T = 0.3; // reduced-motion frame = superposition

const smoothstep = (u: number) => u * u * (3 - 2 * u);

function interp(keys: [number, number][], t: number): number {
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return v0 + (v1 - v0) * smoothstep((t - t0) / (t1 - t0));
  }
  return keys[keys.length - 1][1];
}

/** Trapezoid ramp: 0 before a, 0→1 [a,b], 1 [b,c], 1→0 [c,d], 0 after. */
function ramp(t: number, a: number, b: number, c: number, d: number): number {
  if (t < a || t > d) return 0;
  if (t < b) return (t - a) / (b - a || 1);
  if (t <= c) return 1;
  return 1 - (t - c) / (d - c || 1);
}

export function QubitAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const capRefs = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resolve Carbon tokens to concrete colors for the canvas.
    const cs = getComputedStyle(canvas);
    const tok = (name: string, fallback: string) => (cs.getPropertyValue(name).trim() || fallback);
    const colors = {
      silhouette: tok("--cds-border-strong", "#8d8d8d"),
      wire: tok("--cds-border-subtle", "#525252"),
      fillInner: tok("--cds-layer-02", "#393939"),
      fillOuter: tok("--cds-background", "#161616"),
      text: tok("--cds-text-primary", "#f4f4f4"),
      plus: tok("--cds-support-warning", "#f1c21b"),
    };
    const red = parseColor(tok("--cds-support-error", "#fa4d56"), [250, 77, 86]);
    const yellow = parseColor(tok("--cds-support-warning", "#f1c21b"), [241, 194, 27]);
    const font = `13px 'IBM Plex Sans', system-ui, sans-serif`;

    let cam: Camera;
    const setup = () => {
      const size = stage.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cam = makeCamera(-30, 16, size * 0.34, size / 2, size / 2);
    };

    const draw = (t: number) => {
      const size = cam.cx * 2;
      ctx.clearRect(0, 0, size, size);
      drawSphere(ctx, cam, colors);

      const theta = interp(THETA_KEYS, t);
      const dir = apply(rotZ(theta), [0, 1, 0] as Vec3);
      const equatorness = Math.sin((Math.abs(theta) * Math.PI) / 180); // 0 at poles, 1 at equator
      drawVector(ctx, dir, cam, mixColor(red, yellow, equatorness));

      drawLabel(ctx, [0, 1, 0], cam, "|0⟩", colors.text, font);
      drawLabel(ctx, [0, -1, 0], cam, "|1⟩", colors.text, font);
      drawLabel(ctx, [1, 0, 0], cam, "|+⟩", colors.plus, font);

      // DOM overlays driven directly (no React re-render per frame).
      if (barsRef.current) barsRef.current.style.opacity = String(ramp(t, 0.24, 0.3, 0.46, 0.52));
      const capWindows: [number, number, number, number][] = [
        [0, 0, 0.14, 0.18],
        [0.24, 0.3, 0.46, 0.5],
        [0.58, 0.62, 0.82, 0.86],
      ];
      capRefs.forEach((ref, i) => {
        if (ref.current) ref.current.style.opacity = String(ramp(t, ...capWindows[i]));
      });
    };

    setup();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduce) {
      draw(STATIC_T);
    } else {
      const period = 9000;
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
      aria-label="A qubit state vector on a 3D Bloch sphere rotating from |0⟩ through superposition |+⟩ to |1⟩"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize, aspectRatio: "1" }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
        <div
          ref={barsRef}
          aria-hidden="true"
          style={{ position: "absolute", top: "4%", right: "0", display: "flex", flexDirection: "column", gap: "6px", opacity: 0 }}
        >
          {(["0", "1"] as const).map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", color: "var(--cds-text-secondary)" }}>
              <span>|{k}⟩</span>
              <span style={{ width: "54px", height: "8px", background: "var(--cds-layer-02, #393939)", borderRadius: "2px", overflow: "hidden", display: "block" }}>
                <span style={{ display: "block", height: "100%", width: "50%", marginLeft: k === "1" ? "50%" : 0, background: k === "0" ? "var(--cds-support-info)" : "var(--cds-support-error)" }} />
              </span>
              <span>50%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", height: "1.4rem", width: stageSize, textAlign: "center" }}>
        <span ref={capRefs[0]} style={{ position: "absolute", inset: 0, fontSize: "0.9rem", color: "var(--cds-text-secondary)", opacity: 0 }}>
          Classical bit — always |0⟩ or |1⟩
        </span>
        <span ref={capRefs[1]} style={{ position: "absolute", inset: 0, fontSize: "0.9rem", color: "var(--cds-text-secondary)", opacity: 0 }}>
          H gate → superposition |+⟩
        </span>
        <span ref={capRefs[2]} style={{ position: "absolute", inset: 0, fontSize: "0.9rem", color: "var(--cds-text-secondary)", opacity: 0 }}>
          Measurement collapses to |0⟩ or |1⟩
        </span>
      </div>
    </div>
  );
}

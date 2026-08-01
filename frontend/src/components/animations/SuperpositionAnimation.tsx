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
 * ANIM-02 — Superposition & measurement statistics.
 *
 * Reference: manim/scenes/superposition.py. The state sits at |+⟩ (equal
 * superposition); each "measurement" collapses it at random to |0⟩ or |1⟩ and
 * tallies the outcome. Over many shots the histogram converges to ~50/50 — the
 * statistical meaning of superposition (complements ANIM-01's instantaneous
 * probabilities). Rendered with the shared 3D helper (./bloch).
 *
 * Honors `prefers-reduced-motion`: static |+⟩ frame with a balanced histogram.
 */

const SP: Vec3 = [1, 0, 0]; // |+⟩
const S0: Vec3 = [0, 1, 0]; // |0⟩
const S1: Vec3 = [0, -1, 0]; // |1⟩
const H_AXIS: Vec3 = [1, 1, 0]; // H = 180° about (X+Z)/√2

const SHOT_MS = 1200; // one full cycle: |0⟩ → H → |+⟩ → measure
const P_H_START = 0.06; // |0⟩ shown until here, then the H gate animates
const P_H_END = 0.4; // H rotation finishes (now at |+⟩)
const P_MEASURE = 0.58; // hold |+⟩ until here, then collapse
const RESET_N = 40; // reset the tally after this many shots (re-demonstrate convergence)

const smoothstep = (u: number) => u * u * (3 - 2 * u);

export function SuperpositionAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fill0Ref = useRef<HTMLSpanElement>(null);
  const fill1Ref = useRef<HTMLSpanElement>(null);
  const txt0Ref = useRef<HTMLSpanElement>(null);
  const txt1Ref = useRef<HTMLSpanElement>(null);
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

    const counts: [number, number] = [0, 0];
    const updateHist = () => {
      const total = counts[0] + counts[1];
      const p0 = total ? counts[0] / total : 0.5;
      if (fill0Ref.current) fill0Ref.current.style.width = `${p0 * 100}%`;
      if (fill1Ref.current) fill1Ref.current.style.width = `${(1 - p0) * 100}%`;
      if (txt0Ref.current) txt0Ref.current.textContent = `${counts[0]} · ${Math.round(p0 * 100)}%`;
      if (txt1Ref.current) txt1Ref.current.textContent = `${counts[1]} · ${Math.round((1 - p0) * 100)}%`;
      if (totalRef.current) totalRef.current.textContent = `${total} measurement${total === 1 ? "" : "s"}`;
    };

    const drawBadge = (letter: string) => {
      const s = 24, x = cam.cx - s / 2, y = 8;
      ctx.fillStyle = colors.badgeBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(x, y, s, s);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.badge;
      ctx.font = "bold 14px 'IBM Plex Sans', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, cam.cx, y + s / 2 + 1);
    };

    const drawScene = (dir: Vec3, badge: string | null) => {
      const size = cam.cx * 2;
      ctx.clearRect(0, 0, size, size);
      drawSphere(ctx, cam, colors);
      const equatorness = 1 - Math.abs(dir[1]);
      drawVector(ctx, dir, cam, mixColor(red, yellow, equatorness));
      drawLabel(ctx, S0, cam, "|0⟩", colors.text, font);
      drawLabel(ctx, S1, cam, "|1⟩", colors.text, font);
      drawLabel(ctx, SP, cam, "|+⟩", colors.text, font);
      if (badge) drawBadge(badge);
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      counts[0] = 20;
      counts[1] = 20;
      updateHist();
      drawScene(SP, null);
    } else {
      updateHist();
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
        let dir: Vec3;
        let badge: string | null = null;
        if (phase < P_H_START) {
          dir = S0; // |0⟩
        } else if (phase < P_H_END) {
          // Animate the Hadamard: |0⟩ → |+⟩.
          const p = smoothstep((phase - P_H_START) / (P_H_END - P_H_START));
          dir = apply(rotAxis(H_AXIS, 180 * p), S0);
          badge = "H";
        } else if (phase < P_MEASURE) {
          dir = SP; // |+⟩ superposition
        } else {
          if (outcome === null) {
            outcome = Math.random() < 0.5 ? 0 : 1;
            counts[outcome] += 1;
            updateHist();
          }
          // Measurement collapse is instantaneous — jump straight to the result.
          dir = outcome === 0 ? S0 : S1;
          badge = "M";
        }
        drawScene(dir, badge);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      setup();
      if (reduce) drawScene(SP, null);
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
      aria-label="A Hadamard gate puts |0⟩ into superposition |+⟩, then repeated measurements collapse it to |0⟩ or |1⟩ and are tallied into a histogram that converges to 50/50"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize, aspectRatio: "1" }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>

      <div style={{ width: stageSize, textAlign: "center", fontSize: "0.9rem", color: "var(--cds-text-secondary)" }}>
        H|0⟩ = |+⟩, then measure → random |0⟩ or |1⟩ (→ 50/50)
      </div>

      {/* Running tally of measurement outcomes. */}
      <div style={{ width: stageSize, display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", color: "var(--cds-text-secondary)" }}>
        {(
          [
            ["|0⟩", fill0Ref, txt0Ref, "var(--cds-support-info)"],
            ["|1⟩", fill1Ref, txt1Ref, "var(--cds-support-error)"],
          ] as const
        ).map(([label, fillRef, txtRef, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "2rem" }}>{label}</span>
            <span style={{ flex: 1, height: "10px", background: "var(--cds-layer-02, #393939)", borderRadius: "2px", overflow: "hidden", display: "block" }}>
              <span ref={fillRef} style={{ display: "block", height: "100%", width: "50%", background: color }} />
            </span>
            <span ref={txtRef} style={{ width: "4.2rem", textAlign: "right" }}>0 · 50%</span>
          </div>
        ))}
        <div ref={totalRef} style={{ textAlign: "center", color: "var(--cds-text-helper, #8d8d8d)" }}>0 measurements</div>
      </div>
    </div>
  );
}

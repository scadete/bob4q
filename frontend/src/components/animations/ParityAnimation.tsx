"use client";

import { useEffect, useRef } from "react";

/**
 * ANIM-06 — Parity check: classical vs quantum queries.
 *
 * A hidden function's parity bit: classical logic must query it bit-by-bit
 * (4 sequential queries here), while quantum logic puts the input in
 * superposition, queries the oracle once (phase kickback), and interferes
 * to read the same answer in a single query. Both sides reveal the *same*
 * bit — only the query count differs. Shared by S11 (classical) and S12
 * (quantum); the presenter narrates the side matching the current slide.
 *
 * Honors `prefers-reduced-motion`: static end-state frame, both sides
 * showing the revealed parity and their respective query counts.
 */

const N_CLASSICAL = 4;
const CLASSICAL_STEP_MS = 1000;
const QUANTUM_STEPS = ["Superpose", "Query oracle", "Interfere"] as const;
const QUANTUM_STEP_MS = 320;
const PERIOD_MS = N_CLASSICAL * CLASSICAL_STEP_MS + 1200; // classical tail + hold before reset

interface Colors {
  wire: string;
  box: string;
  text: string;
  textDim: string;
  gate: string;
  state: string;
}

function drawStepper(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  totalWidth: number,
  steps: number,
  activeIndex: number, // -1 = none active yet, >= steps = all done
  colors: Colors,
) {
  const r = 9;
  const gap = steps > 1 ? totalWidth / (steps - 1) : 0;
  const x0 = cx - totalWidth / 2;
  for (let i = 0; i < steps; i++) {
    const x = steps > 1 ? x0 + gap * i : cx;
    const done = i < activeIndex;
    const active = i === activeIndex;
    if (i > 0) {
      const prevX = steps > 1 ? x0 + gap * (i - 1) : cx;
      ctx.strokeStyle = i <= activeIndex ? colors.state : colors.wire;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(prevX + r, y);
      ctx.lineTo(x - r, y);
      ctx.stroke();
    }
    ctx.save();
    ctx.fillStyle = done || active ? colors.state : colors.box;
    ctx.strokeStyle = done || active ? colors.state : colors.wire;
    ctx.lineWidth = 1.8;
    if (active) {
      ctx.shadowColor = colors.state;
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (done || active) ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export function ParityAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const classicalStatusRef = useRef<HTMLDivElement>(null);
  const quantumStatusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(canvas);
    const tok = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    const colors: Colors = {
      wire: tok("--cds-border-subtle", "#525252"),
      box: tok("--cds-layer-01", "#262626"),
      text: tok("--cds-text-primary", "#f4f4f4"),
      textDim: tok("--cds-text-secondary", "#c6c6c6"),
      gate: tok("--cds-border-interactive", "#4589ff"),
      state: tok("--cds-support-warning", "#f1c21b"),
    };

    let W = 0, H = 0;
    const setup = () => {
      W = stage.clientWidth;
      H = Math.round(W * 0.6);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (classicalActive: number, quantumActive: number) => {
      ctx.clearRect(0, 0, W, H);
      const leftCx = W * 0.27;
      const rightCx = W * 0.73;
      const stepperY = H * 0.55;

      // Divider.
      ctx.strokeStyle = colors.wire;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.5, H * 0.12);
      ctx.lineTo(W * 0.5, H * 0.9);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = colors.text;
      ctx.font = `bold ${Math.round(W * 0.032)}px 'IBM Plex Sans', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Classical", leftCx, H * 0.2);
      ctx.fillText("Quantum", rightCx, H * 0.2);

      drawStepper(ctx, leftCx, stepperY, W * 0.32, N_CLASSICAL, classicalActive, colors);
      drawStepper(ctx, rightCx, stepperY, W * 0.32, QUANTUM_STEPS.length, quantumActive, colors);
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      draw(N_CLASSICAL, QUANTUM_STEPS.length);
      if (classicalStatusRef.current) classicalStatusRef.current.textContent = "4 of 4 queries — parity revealed";
      if (quantumStatusRef.current) quantumStatusRef.current.textContent = "1 query — parity revealed";
    } else {
      let cycleStart = performance.now();
      let parityBit = Math.random() < 0.5 ? 0 : 1;
      const frame = (now: number) => {
        let t = now - cycleStart;
        if (t >= PERIOD_MS) {
          cycleStart = now;
          t = 0;
          parityBit = Math.random() < 0.5 ? 0 : 1;
        }

        const classicalDone = Math.min(N_CLASSICAL, Math.floor(t / CLASSICAL_STEP_MS));
        const classicalActive = t >= N_CLASSICAL * CLASSICAL_STEP_MS ? N_CLASSICAL : classicalDone;
        const quantumDone = Math.min(QUANTUM_STEPS.length, Math.floor(t / QUANTUM_STEP_MS));
        const quantumActive = t >= QUANTUM_STEPS.length * QUANTUM_STEP_MS ? QUANTUM_STEPS.length : quantumDone;

        draw(classicalActive, quantumActive);

        if (classicalStatusRef.current) {
          classicalStatusRef.current.textContent =
            classicalActive >= N_CLASSICAL
              ? `4 of 4 queries — parity = ${parityBit}`
              : `Querying bit ${classicalActive + 1} of ${N_CLASSICAL}…`;
        }
        if (quantumStatusRef.current) {
          quantumStatusRef.current.textContent =
            quantumActive >= QUANTUM_STEPS.length
              ? `1 query — parity = ${parityBit}`
              : `${QUANTUM_STEPS[Math.min(quantumActive, QUANTUM_STEPS.length - 1)]}…`;
        }

        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      setup();
      if (reduce) draw(N_CLASSICAL, QUANTUM_STEPS.length);
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
      aria-label="Split-screen comparison: classical logic queries a hidden function's parity bit by bit across 4 sequential queries, while quantum logic puts the input in superposition and reads the same parity in a single query via interference"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ width: stageSize, display: "flex", fontSize: "0.85rem", color: "var(--cds-text-secondary)" }}>
        <div ref={classicalStatusRef} style={{ flex: 1, textAlign: "center" }} />
        <div ref={quantumStatusRef} style={{ flex: 1, textAlign: "center" }} />
      </div>
    </div>
  );
}

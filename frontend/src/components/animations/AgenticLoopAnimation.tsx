"use client";

import { useEffect, useRef } from "react";

/**
 * ANIM-04 — The agentic loop: prompt → MCP tool call → Qiskit code → explanation.
 *
 * Three nodes — You, Bob, MCP — with a pulse traveling the request/
 * response path: You→Bob (prompt), Bob→MCP (tool call), MCP→Bob (result),
 * Bob→You (explanation). The MCP node is tagged "local or remote" — the same
 * Qiskit Code Assistant tool, whether Bob spawns it as a local subprocess or
 * connects to a shared instance over HTTP (see `mcp-server/server.py`'s
 * dual transport).
 *
 * Honors `prefers-reduced-motion`: static frame with all edges drawn and a
 * caption listing the full loop.
 */

interface Point {
  x: number;
  y: number;
}

interface Beat {
  from: "you" | "bob" | "mcp";
  to: "you" | "bob" | "mcp";
  dashed: boolean;
  caption: string;
}

const BEATS: Beat[] = [
  { from: "you", to: "bob", dashed: false, caption: "You ask Bob to explain the Bell circuit" },
  { from: "bob", to: "mcp", dashed: false, caption: "Bob calls the MCP tool explain_circuit" },
  { from: "mcp", to: "bob", dashed: true, caption: "Same MCP tool, running locally or on a remote server" },
  { from: "bob", to: "you", dashed: true, caption: "Bob returns the explanation in plain language" },
];
const BEAT_MS = 1500;

export function AgenticLoopAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(canvas);
    const tok = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    const colors = {
      box: tok("--cds-layer-01", "#262626"),
      border: tok("--cds-border-subtle", "#525252"),
      text: tok("--cds-text-primary", "#f4f4f4"),
      textDim: tok("--cds-text-secondary", "#c6c6c6"),
      accent: tok("--cds-border-interactive", "#4589ff"),
      pulse: tok("--cds-support-warning", "#f1c21b"),
    };

    let W = 0, H = 0;
    const setup = () => {
      W = stage.clientWidth;
      H = Math.round(W * 0.72);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const nodePos = (): Record<Beat["from"], Point> => ({
      you: { x: W * 0.16, y: H * 0.82 },
      bob: { x: W * 0.5, y: H * 0.18 },
      mcp: { x: W * 0.84, y: H * 0.82 },
    });

    const drawNode = (p: Point, label: string, sub: string | undefined, active: boolean, r: number) => {
      ctx.save();
      ctx.fillStyle = colors.box;
      ctx.strokeStyle = active ? colors.pulse : colors.border;
      ctx.lineWidth = active ? 2.4 : 1.6;
      if (active) {
        ctx.shadowColor = colors.pulse;
        ctx.shadowBlur = 14;
      }
      ctx.beginPath();
      ctx.roundRect(p.x - r, p.y - r * 0.62, r * 2, r * 1.24, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = colors.text;
      ctx.font = `bold ${Math.round(r * 0.32)}px 'IBM Plex Sans', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, p.x, p.y);

      if (sub) {
        ctx.fillStyle = colors.textDim;
        ctx.font = `${Math.round(r * 0.2)}px 'IBM Plex Sans', system-ui, sans-serif`;
        ctx.fillText(sub, p.x, p.y + r * 0.68);
      }
    };

    const drawEdge = (a: Point, b: Point, dashed: boolean) => {
      ctx.save();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.4;
      ctx.setLineDash(dashed ? [5, 5] : []);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    };

    const draw = (beatIndex: number, progress: number) => {
      ctx.clearRect(0, 0, W, H);
      const pos = nodePos();
      const r = Math.max(46, W * 0.15);

      drawEdge(pos.you, pos.bob, false);
      drawEdge(pos.bob, pos.mcp, true);

      const active = beatIndex >= 0 ? BEATS[beatIndex] : null;
      drawNode(pos.you, "You", "prompt", active?.from === "you" || active?.to === "you", r);
      drawNode(pos.bob, "Bob", "agentic assistant", active?.from === "bob" || active?.to === "bob", r);
      drawNode(pos.mcp, "MCP", "Qiskit Code Assistant (local or remote)", active?.from === "mcp" || active?.to === "mcp", r);

      if (active) {
        const from = pos[active.from];
        const to = pos[active.to];
        const px = from.x + (to.x - from.x) * progress;
        const py = from.y + (to.y - from.y) * progress;
        ctx.save();
        ctx.fillStyle = colors.pulse;
        ctx.shadowColor = colors.pulse;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(4, r * 0.09), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    setup();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    if (reduce) {
      draw(-1, 0);
      if (captionRef.current) {
        captionRef.current.textContent = "You ↔ Bob ↔ MCP (Qiskit Code Assistant, local or remote) — one loop per question";
      }
    } else {
      const period = BEAT_MS * BEATS.length;
      const start = performance.now();
      let lastCaption = "";
      const frame = (now: number) => {
        const t = ((now - start) % period + period) % period;
        const idx = Math.min(BEATS.length - 1, Math.floor(t / BEAT_MS));
        const local = (t - idx * BEAT_MS) / BEAT_MS;
        const eased = local * local * (3 - 2 * local);
        draw(idx, eased);
        const caption = BEATS[idx].caption;
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

  const stageSize = "min(480px, 92vw)";
  return (
    <div
      role="img"
      aria-label="A loop of three nodes — You, Bob, and MCP — showing a prompt traveling from you to Bob, Bob calling the MCP tool explain_circuit (the Qiskit Code Assistant, running either locally or on a remote server), and the explanation returning to you"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>
      <div
        ref={captionRef}
        style={{ height: "2.2rem", width: stageSize, textAlign: "center", fontSize: "0.9rem", color: "var(--cds-text-secondary)" }}
      />
    </div>
  );
}

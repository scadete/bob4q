"use client";

import { useEffect, useRef } from "react";

/**
 * ANIM-04 — The agentic loop: prompt → MCP tool call → Qiskit code → explanation.
 *
 * Three cards — You, Bob, MCP — connected by four always-visible directional
 * arrows (prompt, tool call, result, explanation) so the loop reads clearly
 * even at rest. A comet-style pulse travels the active leg while its arrow
 * brightens, and a caption below names the beat.
 *
 * Honors `prefers-reduced-motion`: static frame with all edges drawn and a
 * caption listing the full loop.
 */

interface Point {
  x: number;
  y: number;
}

type NodeId = "you" | "bob" | "mcp";

interface Beat {
  from: NodeId;
  to: NodeId;
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

const NODE_COPY: Record<NodeId, { title: string; sub: string }> = {
  you: { title: "You", sub: "prompt" },
  bob: { title: "Bob", sub: "agentic assistant" },
  mcp: { title: "MCP", sub: "Qiskit Code Assistant" },
};

/** Distance from an ellipse's center to its boundary along unit direction (ux, uy). */
function ellipseExit(ux: number, uy: number, a: number, b: number): number {
  const denom = Math.sqrt((ux * ux) / (a * a) + (uy * uy) / (b * b));
  return denom > 0 ? 1 / denom : Math.max(a, b);
}

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

    let W = 0;
    let H = 0;
    let boxW = 0;
    let boxH = 0;
    let titleFontPx = 0;
    let subFontPx = 0;

    const fontTitle = (px: number) => `bold ${Math.round(px)}px 'IBM Plex Sans', system-ui, sans-serif`;
    const fontSub = (px: number) => `${Math.round(px)}px 'IBM Plex Sans', system-ui, sans-serif`;

    const setup = () => {
      W = stage.clientWidth;
      H = Math.round(W * 0.66);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      titleFontPx = Math.max(15, W * 0.032);
      subFontPx = Math.max(11, W * 0.02);
      const paddingX = Math.max(18, W * 0.045);
      const paddingY = Math.max(12, W * 0.03);

      let maxTextWidth = 0;
      ctx.font = fontTitle(titleFontPx);
      for (const { title } of Object.values(NODE_COPY)) {
        maxTextWidth = Math.max(maxTextWidth, ctx.measureText(title).width);
      }
      ctx.font = fontSub(subFontPx);
      for (const { sub } of Object.values(NODE_COPY)) {
        maxTextWidth = Math.max(maxTextWidth, ctx.measureText(sub).width);
      }

      boxW = maxTextWidth + paddingX * 2;
      const lineGap = Math.max(4, W * 0.012);
      boxH = paddingY * 2 + titleFontPx * 1.15 + lineGap + subFontPx * 1.15;
    };

    const nodePos = (): Record<NodeId, Point> => ({
      you: { x: W * 0.15, y: H * 0.82 },
      bob: { x: W * 0.5, y: H * 0.2 },
      mcp: { x: W * 0.85, y: H * 0.82 },
    });

    const drawNode = (p: Point, id: NodeId, active: boolean) => {
      const { title, sub } = NODE_COPY[id];
      const lineGap = Math.max(4, W * 0.012);
      const contentH = titleFontPx * 1.15 + lineGap + subFontPx * 1.15;
      const top = p.y - contentH / 2;
      const titleY = top + (titleFontPx * 1.15) / 2;
      const subY = top + titleFontPx * 1.15 + lineGap + (subFontPx * 1.15) / 2;

      ctx.save();
      if (active) {
        ctx.strokeStyle = colors.accent;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(p.x - boxW / 2 - 6, p.y - boxH / 2 - 6, boxW + 12, boxH + 12, 16);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = colors.box;
      ctx.strokeStyle = active ? colors.accent : colors.border;
      ctx.lineWidth = active ? 2 : 1.4;
      ctx.beginPath();
      ctx.roundRect(p.x - boxW / 2, p.y - boxH / 2, boxW, boxH, 12);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = colors.text;
      ctx.font = fontTitle(titleFontPx);
      ctx.fillText(title, p.x, titleY);
      ctx.fillStyle = colors.textDim;
      ctx.font = fontSub(subFontPx);
      ctx.fillText(sub, p.x, subY);
    };

    const drawArrowhead = (tip: Point, angle: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.translate(tip.x, tip.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 1.6, size * 0.55);
      ctx.lineTo(-size * 1.6, -size * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    /** Line endpoints just outside each node's box, offset to one side of the you/bob/mcp centerline. */
    const edgePoints = (fromP: Point, toP: Point, offset: number) => {
      const dx = toP.x - fromP.x;
      const dy = toP.y - fromP.y;
      const len = Math.hypot(dx, dy);
      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;
      const insetFrom = ellipseExit(ux, uy, boxW / 2, boxH / 2) + 4;
      const insetTo = ellipseExit(-ux, -uy, boxW / 2, boxH / 2) + 12;
      const start: Point = { x: fromP.x + ux * insetFrom + nx * offset, y: fromP.y + uy * insetFrom + ny * offset };
      const end: Point = { x: toP.x - ux * insetTo + nx * offset, y: toP.y - uy * insetTo + ny * offset };
      return { start, end, angle: Math.atan2(dy, dx) };
    };

    const drawEdge = (
      fromP: Point,
      toP: Point,
      opts: { dashed: boolean; offset: number; color: string; alpha: number; lineWidth: number },
    ) => {
      const { start, end, angle } = edgePoints(fromP, toP, opts.offset);
      ctx.save();
      ctx.globalAlpha = opts.alpha;
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.lineWidth;
      ctx.setLineDash(opts.dashed ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.restore();
      drawArrowhead(end, angle, Math.max(4, boxH * 0.09), opts.color, opts.alpha);
      return { start, end };
    };

    const EDGES: { from: NodeId; to: NodeId; dashed: boolean; side: 1 | -1 }[] = [
      { from: "you", to: "bob", dashed: false, side: 1 },
      { from: "bob", to: "mcp", dashed: false, side: 1 },
      { from: "mcp", to: "bob", dashed: true, side: -1 },
      { from: "bob", to: "you", dashed: true, side: -1 },
    ];

    const draw = (beatIndex: number, progress: number) => {
      ctx.clearRect(0, 0, W, H);
      const pos = nodePos();
      const active = beatIndex >= 0 ? BEATS[beatIndex] : null;
      const offset = Math.max(6, W * 0.016);

      let activeLine: { start: Point; end: Point } | null = null;
      for (const e of EDGES) {
        const isActive = !!active && active.from === e.from && active.to === e.to;
        const line = drawEdge(pos[e.from], pos[e.to], {
          dashed: e.dashed,
          offset: e.side * offset,
          color: isActive ? colors.pulse : colors.border,
          alpha: isActive ? 0.95 : 0.45,
          lineWidth: isActive ? 2.4 : 1.3,
        });
        if (isActive) activeLine = line;
      }

      (Object.keys(pos) as NodeId[]).forEach((id) => {
        drawNode(pos[id], id, active?.from === id || active?.to === id);
      });

      if (active && activeLine) {
        const trailSteps = 5;
        for (let i = trailSteps - 1; i >= 0; i--) {
          const t = Math.max(0, progress - i * 0.05);
          const alpha = (1 - i / trailSteps) * 0.9;
          const r = Math.max(3, boxH * 0.07) * (1 - i / (trailSteps * 1.6));
          const px = activeLine.start.x + (activeLine.end.x - activeLine.start.x) * t;
          const py = activeLine.start.y + (activeLine.end.y - activeLine.start.y) * t;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = colors.pulse;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
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

  const stageSize = "min(520px, 92vw)";
  return (
    <div
      role="img"
      aria-label="A loop diagram of three cards — You, Bob, and MCP — with directional arrows for the prompt (You to Bob), the tool call (Bob to MCP), the result (MCP back to Bob), and the explanation (Bob back to You)"
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

/**
 * Shared circuit-diagram drawing primitives for canvas-based animations.
 *
 * Pulled out of EntanglementAnimation.tsx so the same wire/gate/CNOT/meter
 * rendering can be reused wherever a circuit diagram appears (e.g. the S8
 * "gates & circuits" vocabulary slide) without re-deriving the geometry.
 */

export interface CircuitColors {
  wire: string;
  box: string;
  text: string;
  textDim: string;
  gate: string;
  state: string;
  play: string;
}

/** Reads the standard circuit color tokens from a canvas's computed style. */
export function readCircuitColors(canvas: HTMLCanvasElement): CircuitColors {
  const cs = getComputedStyle(canvas);
  const tok = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    wire: tok("--cds-border-strong", "#8d8d8d"),
    box: tok("--cds-layer-01", "#262626"),
    text: tok("--cds-text-primary", "#f4f4f4"),
    textDim: tok("--cds-text-secondary", "#c6c6c6"),
    gate: tok("--cds-border-interactive", "#4589ff"),
    state: tok("--cds-support-warning", "#f1c21b"),
    play: tok("--cds-support-info", "#4589ff"),
  };
}

/** A horizontal qubit wire from x0 to x1 at height y. */
export function drawWire(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, color: string, width = 1.6) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
}

/** A single-qubit gate box (e.g. H, X, Z) centered at (cx, cy). */
export function drawGateBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  box: number,
  colors: Pick<CircuitColors, "box" | "gate" | "text">,
) {
  ctx.fillStyle = colors.box;
  ctx.strokeStyle = colors.gate;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(cx - box / 2, cy - box / 2, box, box);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${Math.round(box * 0.5)}px 'IBM Plex Sans', system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + 1);
}

/** CNOT: filled control dot on the control wire, line down to a ⊕ target ring. */
export function drawCNOT(
  ctx: CanvasRenderingContext2D,
  cx: number,
  yControl: number,
  yTarget: number,
  r: number,
  color: string,
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, yControl);
  ctx.lineTo(cx, yTarget);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, yControl, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, yTarget, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r, yTarget);
  ctx.lineTo(cx + r, yTarget);
  ctx.moveTo(cx, yTarget - r);
  ctx.lineTo(cx, yTarget + r);
  ctx.stroke();
}

/** Measurement meter box: shows the collapsed outcome digit, or a gauge arc while pending. */
export function drawMeterBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  box: number,
  colors: Pick<CircuitColors, "box" | "wire" | "state" | "textDim">,
  outcome: string | null,
) {
  ctx.fillStyle = colors.box;
  ctx.strokeStyle = outcome ? colors.state : colors.wire;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(x - box / 2, y - box / 2, box, box);
  ctx.fill();
  ctx.stroke();
  if (outcome) {
    ctx.fillStyle = colors.state;
    ctx.font = `bold ${Math.round(box * 0.6)}px 'IBM Plex Sans', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(outcome, x, y + 1);
  } else {
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y + box * 0.15, box * 0.3, Math.PI, 0);
    ctx.stroke();
  }
}

/** Vertical execution "playhead" line at x, spanning from just above yTop to just below yBottom. */
export function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  yTop: number,
  yBottom: number,
  color: string,
  alpha: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x, yBottom);
  ctx.stroke();
  ctx.restore();
}

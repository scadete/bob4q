"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  drawCNOT,
  drawGateBox,
  drawMeterBox,
  drawPlayhead,
  drawToffoli,
  drawWire,
  readCircuitColors,
  type CircuitColors,
} from "./circuit";

/**
 * ANIM-06 — Parity check, classical vs quantum, as the problem size grows.
 *
 * Hidden function f(x) = x·s mod 2 for a secret bitstring s. Both slides cycle
 * through n = 2 → 4 → 8 bits (s = prefix of 10110100) and plot the number of
 * oracle queries needed at each size.
 *
 * - Slide 11 (`ClassicalParityAnimation`): split screen. Left, f as classical
 *   logic gates (one AND per bit, then an XOR tree). Right, a gate-for-gate
 *   reversible copy: wires |xᵢ⟩, |sᵢ⟩, |aᵢ=0⟩ per bit, one Toffoli per AND
 *   (xᵢ ∧ sᵢ → aᵢ) and one CNOT per XOR in the same tree (n + n−1 gates on
 *   both sides). The circuit is generic — s is an input, not wired in. Each
 *   basis query x = e_i reads one bit sᵢ, so both need n queries — the bar
 *   chart grows 2, 4, 8.
 *
 * - Slide 12 (`QuantumParityAnimation`): the oracle approach. With s built
 *   into U_f, each Toffoli with sᵢ = 1 reduces to a CNOT and each with sᵢ = 0
 *   drops out. Wrapped in Hadamards with the ancilla in |−⟩
 *   (Bernstein–Vazirani), one query reads all of s at any n — the bar chart
 *   stays at 1 against the classical outlines.
 */

const SECRET_FULL = [1, 0, 1, 1, 0, 1, 0, 0] as const;
const SIZES = [2, 4, 8] as const;
const MAX_N = 8;
const METER_P = 0.92;

const secretFor = (n: number): number[] => SECRET_FULL.slice(0, n);
const parityOf = (bits: readonly number[]) => bits.reduce((acc, b) => acc ^ b, 0);
const unitMask = (n: number, i: number) => Array.from({ length: n }, (_, k) => (k === i ? "1" : "0")).join("");

/**
 * Bit values through the parity network for basis query x = e_run.
 * `levels[0][i]` = xᵢ ∧ sᵢ; `levels[k][j]` = XOR of levels[k−1][2j], [2j+1].
 */
function parityLevels(n: number, run: number) {
  const s = secretFor(n);
  const x = s.map((_, i) => (i === run ? 1 : 0));
  const levels: number[][] = [x.map((xi, i) => xi & s[i])];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    const next: number[] = [];
    for (let j = 0; j < prev.length; j += 2) next.push(prev[j] ^ prev[j + 1]);
    levels.push(next);
  }
  return { s, x, levels };
}

/** Playhead positions (0..1) where the AND column and each XOR level fire; shared by both slide-11 panels. */
interface GateTiming {
  andP: number;
  xorP: number[];
}

interface ExtendedColors extends CircuitColors {
  panelBg: string;
  borderSubtle: string;
}

function readParityColors(canvas: HTMLCanvasElement): ExtendedColors {
  const base = readCircuitColors(canvas);
  const cs = getComputedStyle(canvas);
  const tok = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    ...base,
    panelBg: tok("--cds-layer-02", "#393939"),
    borderSubtle: tok("--cds-border-subtle", "#525252"),
  };
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const mono = (px: number, bold = false) => `${bold ? "bold " : ""}${px}px 'IBM Plex Mono', monospace`;
const sans = (px: number) => `bold ${px}px 'IBM Plex Sans', system-ui, sans-serif`;
const sansReg = (px: number) => `${px}px 'IBM Plex Sans', system-ui, sans-serif`;

/** Largest font size (<= basePx, >= 8px) at which `text` fits in `maxW` pixels. */
function fitFontPx(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (px: number) => string,
  basePx: number,
  maxW: number,
): number {
  ctx.font = font(basePx);
  const w = ctx.measureText(text).width;
  return w <= maxW ? basePx : Math.max(8, Math.floor((basePx * maxW) / w));
}

function fillTextFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: (px: number) => string,
  basePx: number,
  maxW: number,
) {
  ctx.font = font(fitFontPx(ctx, text, font, basePx, maxW));
  ctx.fillText(text, x, y);
}

function drawOracleFrame(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  yTop: number,
  yBottom: number,
  colors: ExtendedColors,
  active: boolean,
  label: string,
  fontPx: number,
) {
  ctx.save();
  ctx.fillStyle = colors.box;
  ctx.globalAlpha = active ? 0.45 : 0.25;
  ctx.beginPath();
  ctx.roundRect(x0, yTop, x1 - x0, yBottom - yTop, 8);
  ctx.fill();
  ctx.globalAlpha = active ? 0.95 : 0.65;
  ctx.strokeStyle = active ? colors.state : colors.gate;
  ctx.lineWidth = active ? 2 : 1.4;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = active ? colors.state : colors.textDim;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  fillTextFit(ctx, label, (x0 + x1) / 2, yTop - 5, (px) => mono(px, true), Math.max(10, Math.round(fontPx)), (x1 - x0) * 1.3);
  ctx.restore();
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  pts: ReadonlyArray<readonly [number, number]>,
  color: string,
  width: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.stroke();
}

/** Elbow route: horizontal, vertical at the midpoint, horizontal. */
function elbow(x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  const xm = (x0 + x1) / 2;
  return [
    [x0, y0],
    [xm, y0],
    [xm, y1],
    [x1, y1],
  ];
}

/** AND gate (flat back, round front); output tip at x + 1.1·g. */
function drawAndGate(ctx: CanvasRenderingContext2D, x: number, cy: number, g: number, fill: string, stroke: string, lw: number) {
  const r = g / 2;
  const w = g * 1.1;
  ctx.beginPath();
  ctx.moveTo(x, cy - r);
  ctx.lineTo(x + w - r, cy - r);
  ctx.arc(x + w - r, cy, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x, cy + r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** XOR gate (OR body + extra back curve); output tip at x + 1.1·g. */
function drawXorGate(ctx: CanvasRenderingContext2D, x: number, cy: number, g: number, fill: string, stroke: string, lw: number) {
  const r = g / 2;
  const w = g * 1.1;
  ctx.beginPath();
  ctx.moveTo(x, cy - r);
  ctx.quadraticCurveTo(x + w * 0.6, cy - r, x + w, cy);
  ctx.quadraticCurveTo(x + w * 0.6, cy + r, x, cy + r);
  ctx.quadraticCurveTo(x + w * 0.28, cy, x, cy - r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
  const off = g * 0.17;
  ctx.beginPath();
  ctx.moveTo(x - off, cy - r);
  ctx.quadraticCurveTo(x - off + w * 0.28, cy, x - off, cy + r);
  ctx.stroke();
}

function drawPanelBg(ctx: CanvasRenderingContext2D, R: Rect, colors: ExtendedColors) {
  ctx.save();
  ctx.fillStyle = colors.panelBg;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.roundRect(R.x, R.y, R.w, R.h, 10);
  ctx.fill();
  ctx.restore();
}

function drawPanelTitle(ctx: CanvasRenderingContext2D, R: Rect, text: string, fs: number, color: string) {
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fillTextFit(ctx, text, R.x + R.w / 2, R.y + fs * 0.95, sans, Math.round(fs * 1.1), R.w - 8);
}

function drawPanelCaption(ctx: CanvasRenderingContext2D, R: Rect, text: string, fs: number, color: string) {
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fillTextFit(ctx, text, R.x + R.w / 2, R.y + R.h - fs * 0.8, sansReg, Math.round(fs * 0.88), R.w - 8);
}

/** Vertical layout of `rows` evenly spaced rows inside a panel, capped so small n stays compact. */
function rowLayout(R: Rect, rows: number, fs: number) {
  // Leave room for the title + oracle label above and the caption below; the
  // extra 1.8 steps keep the first/last gates (and the oracle frame) inside.
  const top = R.y + fs * 3.9;
  const bottom = R.y + R.h - fs * 2.1;
  const avail = Math.max(10, bottom - top);
  const step = rows > 1 ? Math.min(avail / (rows - 1 + 1.8), R.h * 0.2) : 0;
  const first = (top + bottom) / 2 - (step * (rows - 1)) / 2;
  return { ys: Array.from({ length: rows }, (_, i) => first + i * step), step };
}

/* ------------------------------------------------------------------ */
/* Slide 11 panels                                                     */
/* ------------------------------------------------------------------ */

/**
 * Left panel: f(x) = x·s mod 2 as AND gates + XOR tree, for basis query `run`.
 * `p` is the shared playhead (0..1, or <0 for a settled frame).
 */
function drawLogicPanel(
  ctx: CanvasRenderingContext2D,
  R: Rect,
  n: number,
  run: number,
  p: number,
  colors: ExtendedColors,
  fs: number,
): GateTiming {
  const { s, x, levels } = parityLevels(n, run);
  const f = levels[levels.length - 1][0];
  const L = levels.length - 1; // XOR levels

  drawPanelBg(ctx, R, colors);
  drawPanelTitle(ctx, R, "Classical logic gates", fs, colors.text);

  const { ys, step } = rowLayout(R, n, fs);
  const g = Math.max(10, Math.min(30, (step || R.h * 0.2) * 0.62));
  const gw = g * 1.1;
  const pin = g * 0.25;
  const rowFs = Math.max(8, Math.min(fs, Math.round((step || 40) * 0.42)));

  const xIn = R.x + R.w * 0.15;
  const andX = R.x + R.w * 0.34;
  const outX = R.x + R.w * 0.95;
  const a0 = andX + gw + R.w * 0.08;
  const a1 = outX - g * 0.5 - R.w * 0.05 - gw;
  const xorX = Array.from({ length: L }, (_, k) => (L === 1 ? (a0 + a1) / 2 : a0 + (k * (a1 - a0)) / (L - 1)));

  const nodeY: number[][] = [ys];
  for (let k = 1; k <= L; k++) {
    const prev = nodeY[k - 1];
    nodeY.push(Array.from({ length: prev.length / 2 }, (_, j) => (prev[2 * j] + prev[2 * j + 1]) / 2));
  }
  const nodeOutX = (k: number) => (k === 0 ? andX + gw : xorX[k - 1] + gw);

  const th = (px: number) => (px - xIn) / (outX - xIn);
  const passed = (px: number) => p < 0 || p >= th(px);
  const outOn = p < 0 || p >= METER_P;
  const lit = (bit: number, on: boolean) => bit === 1 && on;
  const wc = (on: boolean) => (on ? colors.state : colors.wire);
  const ww = (on: boolean) => (on ? 2.6 : 1.4);

  drawOracleFrame(
    ctx,
    andX - R.w * 0.18,
    xorX[L - 1] + gw + R.w * 0.025,
    ys[0] - g * 0.95,
    ys[n - 1] + g * 0.8,
    colors,
    p >= th(andX) && p <= th(xorX[L - 1] + gw),
    "Oracle U_f = AND + XOR",
    fs * 0.85,
  );

  for (let i = 0; i < n; i++) {
    const yx = ys[i] - pin;
    const yS = ys[i] + pin;
    const on = lit(x[i], p < 0 || p >= 0.02);
    strokePath(ctx, [[xIn, yx], [andX + 2, yx]], wc(on), ww(on));
    ctx.fillStyle = x[i] ? colors.state : colors.textDim;
    ctx.font = mono(rowFs, x[i] === 1);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`x${i}=${x[i]}`, xIn - 4, yx);

    const sStart = andX - R.w * 0.07;
    strokePath(ctx, [[sStart, yS], [andX + 2, yS]], colors.borderSubtle, 1.2);
    ctx.fillStyle = colors.textDim;
    ctx.font = mono(Math.max(8, Math.round(rowFs * 0.8)));
    ctx.fillText(`s${i}=${s[i]}`, sStart - 2, yS);
  }

  // Wires between levels.
  for (let k = 1; k <= L; k++) {
    const srcOn = passed(nodeOutX(k - 1));
    for (let j = 0; j < levels[k - 1].length; j++) {
      const on = lit(levels[k - 1][j], srcOn);
      const ty = nodeY[k][Math.floor(j / 2)] + (j % 2 === 0 ? -pin : pin);
      strokePath(ctx, elbow(nodeOutX(k - 1), nodeY[k - 1][j], xorX[k - 1] + gw * 0.12, ty), wc(on), ww(on));
    }
  }
  const cOut = nodeY[L][0];
  const fOn = lit(f, passed(nodeOutX(L)));
  strokePath(ctx, [[nodeOutX(L), cOut], [outX - g * 0.42, cOut]], wc(fOn), ww(fOn));

  // Gates.
  for (let i = 0; i < n; i++) {
    const on = lit(levels[0][i], passed(nodeOutX(0)));
    drawAndGate(ctx, andX, ys[i], g, colors.box, on ? colors.state : colors.gate, on ? 2.2 : 1.5);
  }
  for (let k = 1; k <= L; k++) {
    for (let j = 0; j < levels[k].length; j++) {
      const on = lit(levels[k][j], passed(nodeOutX(k)));
      drawXorGate(ctx, xorX[k - 1], nodeY[k][j], g, colors.box, on ? colors.state : colors.gate, on ? 2.2 : 1.5);
    }
  }

  // 0/1 tags on gate outputs (skipped when gates get too small to label).
  if (g >= 14) {
    for (let k = 0; k < L; k++) {
      if (!passed(nodeOutX(k))) continue;
      levels[k].forEach((bit, j) => {
        ctx.fillStyle = bit ? colors.state : colors.textDim;
        ctx.font = mono(Math.round(rowFs * 0.8), true);
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(bit), nodeOutX(k) + 3, nodeY[k][j] - 2);
      });
    }
  }

  // Output lamp f(x).
  const lampR = Math.max(9, g * 0.42);
  ctx.save();
  ctx.beginPath();
  ctx.arc(outX, cOut, lampR, 0, Math.PI * 2);
  ctx.fillStyle = outOn && f ? colors.state : colors.box;
  if (outOn && f) {
    ctx.shadowColor = colors.state;
    ctx.shadowBlur = 14;
  }
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = outOn ? colors.state : colors.wire;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(outX, cOut, lampR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = outOn && f ? colors.box : outOn ? colors.state : colors.textDim;
  ctx.font = mono(Math.round(lampR * 1.2), true);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(outOn ? String(f) : "?", outX, cOut + 1);
  ctx.fillStyle = colors.textDim;
  ctx.font = mono(Math.round(fs * 0.8));
  ctx.textBaseline = "top";
  ctx.fillText("f(x)", outX, cOut + lampR + 4);

  if (p >= 0 && p <= 1) {
    drawPlayhead(ctx, xIn + (outX - xIn) * p, ys[0] - g * 0.7, ys[n - 1] + g * 0.65, colors.play, 0.9);
  }

  drawPanelCaption(ctx, R, "AND masks each x bit with its s bit · XOR tree adds them mod 2", fs, colors.textDim);

  return { andP: th(andX + gw / 2), xorP: xorX.map((xx) => th(xx + gw / 2)) };
}

/**
 * Right panel: gate-for-gate reversible copy of the logic panel. Per bit,
 * wires |xᵢ⟩, |sᵢ⟩ and an ancilla |aᵢ=0⟩; one Toffoli per AND (xᵢ ∧ sᵢ → aᵢ),
 * then one CNOT per XOR in the same tree, result in a₀. Generic: s is an input,
 * so the gates never depend on its value. Gate columns fire at the same
 * playhead positions as the matching gates on the left (`timing`).
 */
function drawReversiblePanel(
  ctx: CanvasRenderingContext2D,
  R: Rect,
  n: number,
  run: number,
  p: number,
  colors: ExtendedColors,
  fs: number,
  timing: GateTiming,
) {
  const { s, x, levels } = parityLevels(n, run);
  const L = levels.length - 1;
  const f = levels[L][0];

  drawPanelBg(ctx, R, colors);
  drawPanelTitle(ctx, R, "Same logic, reversible quantum gates", fs, colors.text);

  // Rows in (xᵢ, sᵢ, aᵢ) triplets with an extra gap between triplets, so each
  // Toffoli reads as its own gate rather than one long line down the column.
  const GROUP_GAP = 0.8;
  const units = 3 * n - 1 + (n - 1) * GROUP_GAP;
  const top = R.y + fs * 3.9;
  const bottom = R.y + R.h - fs * 2.1;
  const step = Math.min(Math.max(10, bottom - top) / (units + 1.8), R.h * 0.2);
  const first = (top + bottom) / 2 - (step * units) / 2;
  const rowY = (i: number, k: number) => first + (3 * i + k + i * GROUP_GAP) * step;
  const yX = (i: number) => rowY(i, 0);
  const yS = (i: number) => rowY(i, 1);
  const yA = (i: number) => rowY(i, 2);
  const box = Math.max(10, Math.min(26, step * 0.85));
  const r = Math.max(4, Math.min(9, step * 0.36));
  const rowFs = Math.max(8, Math.min(fs, Math.round(step * 0.62)));

  const labelX = R.x + R.w * 0.17;
  const sx0 = R.x + R.w * 0.19;
  const sx1 = R.x + R.w * 0.93;
  const wireEnd = R.x + R.w * 0.97;
  const prog2x = (q: number) => sx0 + (sx1 - sx0) * q;
  const reached = (q: number) => p < 0 || p >= q;
  const curX = p < 0 ? wireEnd : prog2x(p);
  // Meter sits at the end of the sweep (like the f(x) lamp on the left) so it
  // clears the last CNOT column; it still reads out at METER_P.
  const xMeter = prog2x(1);
  const measured = reached(METER_P);

  // When each ancilla's value changes: the Toffoli column, then any XOR level
  // where it is the CNOT target (target a_{j·2^k}, control a_{j·2^k + 2^(k−1)}).
  const events: Array<Array<[number, number]>> = Array.from({ length: n }, (_, i) => [[timing.andP, levels[0][i]]]);
  for (let k = 1; k <= L; k++) {
    const stride = 2 ** k;
    levels[k].forEach((v, j) => events[j * stride].push([timing.xorP[k - 1], v]));
  }

  drawOracleFrame(
    ctx,
    prog2x(timing.andP - 0.06),
    prog2x(timing.xorP[L - 1] + 0.05),
    yX(0) - box * 0.7,
    yA(n - 1) + box * 0.6,
    colors,
    p >= timing.andP - 0.06 && p <= timing.xorP[L - 1] + 0.05,
    "Oracle U_f = Toffoli + CNOT tree",
    fs * 0.85,
  );

  const label = (text: string, y: number, color: string, bold: boolean) => {
    ctx.fillStyle = color;
    ctx.font = mono(rowFs, bold);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(text, labelX, y);
  };

  for (let i = 0; i < n; i++) {
    // Query input |xᵢ⟩ (gold when 1) and secret input |sᵢ⟩ (blue when 1).
    drawWire(ctx, sx0, wireEnd, yX(i), colors.wire, 1.2);
    if (x[i] === 1) strokePath(ctx, [[sx0, yX(i)], [Math.max(sx0, curX), yX(i)]], colors.state, 2.4);
    label(`x${i} |${x[i]}⟩`, yX(i), x[i] ? colors.state : colors.textDim, x[i] === 1);

    drawWire(ctx, sx0, wireEnd, yS(i), colors.wire, 1.2);
    if (s[i] === 1) strokePath(ctx, [[sx0, yS(i)], [Math.max(sx0, curX), yS(i)]], colors.gate, 1.8);
    label(`s${i} |${s[i]}⟩`, yS(i), colors.textDim, false);

    // Ancilla: lit on the stretches where its value is 1.
    drawWire(ctx, sx0, wireEnd, yA(i), colors.wire, 1.2);
    const end = i === 0 ? xMeter : wireEnd;
    events[i].forEach(([q, v], e) => {
      const next = events[i][e + 1];
      const segEnd = Math.min(next ? prog2x(next[0]) : end, curX);
      if (v === 1 && reached(q) && segEnd > prog2x(q)) strokePath(ctx, [[prog2x(q), yA(i)], [segEnd, yA(i)]], colors.state, 2.4);
    });
    label(`a${i} |0⟩`, yA(i), colors.text, true);
  }

  // AND → Toffoli, one per bit.
  for (let i = 0; i < n; i++) {
    const on = reached(timing.andP) && levels[0][i] === 1;
    drawToffoli(ctx, prog2x(timing.andP), yX(i), yS(i), yA(i), r, on ? colors.state : colors.gate);
  }
  // XOR tree → CNOTs between ancillas.
  for (let k = 1; k <= L; k++) {
    const stride = 2 ** k;
    for (let j = 0; j < levels[k].length; j++) {
      const on = reached(timing.xorP[k - 1]) && levels[k - 1][2 * j + 1] === 1;
      drawCNOT(ctx, prog2x(timing.xorP[k - 1]), yA(j * stride + stride / 2), yA(j * stride), r, on ? colors.state : colors.gate);
    }
  }

  drawMeterBox(ctx, xMeter, yA(0), box, colors, measured ? String(f) : null);

  if (p >= 0 && p <= 1) {
    drawPlayhead(ctx, prog2x(p), yX(0) - box * 0.8, yA(n - 1) + box * 0.7, colors.play, 0.9);
  }

  drawPanelCaption(
    ctx,
    R,
    `${n} Toffoli (= AND) + ${n - 1} CNOT (= XOR) — same gates as the left · a0 holds f(x)`,
    fs,
    colors.textDim,
  );
}

/* ------------------------------------------------------------------ */
/* Shared bottom strip: secret register + scaling chart                */
/* ------------------------------------------------------------------ */

function drawRegister(
  ctx: CanvasRenderingContext2D,
  R: Rect,
  n: number,
  revealed: readonly boolean[],
  colors: ExtendedColors,
  fs: number,
) {
  const s = secretFor(n);
  const cell = Math.max(14, Math.min(R.h * 0.4, (R.w * 0.62) / MAX_N - 4));
  const gap = 4;
  const labelW = fs * 2.6;
  const cy = R.y + R.h * 0.42;
  const x0 = R.x + labelW;

  ctx.fillStyle = colors.textDim;
  ctx.font = mono(Math.round(fs), true);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("s =", R.x + 4, cy);

  for (let i = 0; i < n; i++) {
    const cx = x0 + i * (cell + gap);
    const on = revealed[i];
    ctx.fillStyle = colors.box;
    ctx.strokeStyle = on ? colors.state : colors.borderSubtle;
    ctx.lineWidth = on ? 1.8 : 1.2;
    ctx.beginPath();
    ctx.roundRect(cx, cy - cell / 2, cell, cell, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = on ? colors.state : colors.textDim;
    ctx.font = mono(Math.round(cell * 0.55), true);
    ctx.textAlign = "center";
    ctx.fillText(on ? String(s[i]) : "?", cx + cell / 2, cy + 1);
  }

  const all = revealed.slice(0, n).every(Boolean);
  ctx.fillStyle = all ? colors.state : colors.textDim;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fillTextFit(ctx, `parity = ${all ? parityOf(s) : "?"}`, R.x + 4, R.y + R.h * 0.86, (px) => mono(px, all), Math.round(fs * 0.95), R.w - 8);
}

/**
 * Bar chart of oracle queries per problem size. `used[k]` is the solid bar for
 * SIZES[k]; when `ghostClassical`, dashed outlines show the classical n.
 */
function drawScaling(
  ctx: CanvasRenderingContext2D,
  R: Rect,
  used: readonly number[],
  activeIdx: number,
  ghostClassical: boolean,
  colors: ExtendedColors,
  fs: number,
) {
  ctx.fillStyle = colors.textDim;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  fillTextFit(ctx, "Oracle queries needed", R.x + 4, R.y + 2, sans, Math.round(fs * 0.9), R.w - 8);

  const top = R.y + fs * 1.9;
  const base = R.y + R.h - fs * 1.4;
  const unit = (base - top) / MAX_N;
  const slots = SIZES.length;
  const slotW = (R.w - 8) / slots;
  const barW = Math.min(slotW * 0.45, 44);

  strokePath(ctx, [[R.x + 4, base], [R.x + R.w - 4, base]], colors.borderSubtle, 1);

  SIZES.forEach((n, k) => {
    const cx = R.x + 4 + slotW * (k + 0.5);
    if (ghostClassical) {
      ctx.save();
      ctx.strokeStyle = colors.textDim;
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - barW / 2, base - n * unit, barW, n * unit);
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.font = mono(Math.round(fs * 0.7));
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${n}`, cx + barW / 2 + 3, base - n * unit + 6);
    }
    const v = used[k];
    if (v > 0) {
      ctx.save();
      ctx.fillStyle = k === activeIdx ? colors.state : colors.gate;
      ctx.globalAlpha = k === activeIdx ? 0.95 : 0.75;
      ctx.fillRect(cx - barW / 2, base - v * unit, barW, v * unit);
      ctx.restore();
    }
    ctx.fillStyle = k === activeIdx ? colors.state : colors.text;
    ctx.font = mono(Math.round(fs * 0.85), true);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    if (v > 0) ctx.fillText(String(v), cx, base - v * unit - 2);
    ctx.fillStyle = k === activeIdx ? colors.state : colors.textDim;
    ctx.font = mono(Math.round(fs * 0.8), k === activeIdx);
    ctx.textBaseline = "top";
    ctx.fillText(`n=${n}`, cx, base + 3);
  });
}

/* ------------------------------------------------------------------ */
/* Timeline helpers                                                    */
/* ------------------------------------------------------------------ */

interface Seg {
  nIdx: number;
  /** Query index within this size, or -1 for the hold after it. */
  q: number;
  dur: number;
}

function locate(segs: readonly Seg[], t: number): { seg: Seg; local: number } {
  let acc = 0;
  for (const seg of segs) {
    if (t < acc + seg.dur) return { seg, local: (t - acc) / seg.dur };
    acc += seg.dur;
  }
  const last = segs[segs.length - 1];
  return { seg: last, local: 1 };
}

const totalMs = (segs: readonly Seg[]) => segs.reduce((a, s) => a + s.dur, 0);

/** Shared canvas setup + rAF loop. `render(t)` draws one frame; `t < 0` = reduced-motion end frame. */
function useCanvasLoop(
  stageRef: React.RefObject<HTMLDivElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  aspect: (w: number) => number,
  periodMs: number,
  render: (ctx: CanvasRenderingContext2D, W: number, H: number, colors: ExtendedColors, t: number) => void,
) {
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const colors = readParityColors(canvas);

    let W = 0;
    let H = 0;
    const setup = () => {
      W = stage.clientWidth;
      H = Math.round(W * aspect(W));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setup();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const paint = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      render(ctx, W, H, colors, t);
    };
    if (reduce) {
      paint(-1);
    } else {
      const start = performance.now();
      const frame = (now: number) => {
        paint((now - start) % periodMs);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    const onResize = () => {
      setup();
      if (reduce) paint(-1);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Banner + panel(s) + bottom strip layout. Stacks vertically on narrow stages. */
function layout(W: number, H: number, fs: number, stacked: boolean, twoPanels: boolean) {
  const bannerH = fs * 2.4;
  const gap = 12;
  const stripH = stacked ? Math.max(170, H * 0.2) : Math.max(84, H * 0.18);
  const panelsH = H - bannerH - stripH - gap;
  let panels: Rect[];
  if (!twoPanels) {
    panels = [{ x: 0, y: bannerH, w: W, h: panelsH }];
  } else if (stacked) {
    const ph = (panelsH - gap) / 2;
    panels = [
      { x: 0, y: bannerH, w: W, h: ph },
      { x: 0, y: bannerH + ph + gap, w: W, h: ph },
    ];
  } else {
    const pw = (W - gap) / 2;
    panels = [
      { x: 0, y: bannerH, w: pw, h: panelsH },
      { x: pw + gap, y: bannerH, w: pw, h: panelsH },
    ];
  }
  const sy = bannerH + panelsH + gap;
  const strip: Rect = { x: 0, y: sy, w: W, h: stripH };
  const reg: Rect = stacked ? { x: 8, y: sy + 4, w: W - 16, h: stripH * 0.4 } : { x: 12, y: sy + 6, w: W * 0.5 - 18, h: stripH - 12 };
  const chart: Rect = stacked
    ? { x: 8, y: sy + stripH * 0.42, w: W - 16, h: stripH * 0.56 }
    : { x: W * 0.52, y: sy + 6, w: W * 0.46, h: stripH - 12 };
  return { bannerH, panels, strip, reg, chart };
}

function drawBanner(ctx: CanvasRenderingContext2D, W: number, bannerH: number, text: string, fs: number, colors: ExtendedColors) {
  ctx.fillStyle = colors.state;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fillTextFit(ctx, text, W / 2, bannerH / 2, sans, Math.round(fs * 1.2), W - 8);
}

/* ------------------------------------------------------------------ */
/* Slide 11                                                            */
/* ------------------------------------------------------------------ */

const CL_QUERY_MS: Record<number, number> = { 2: 1700, 4: 1150, 8: 750 };
const CL_SEGS: Seg[] = SIZES.flatMap((n, nIdx) => [
  ...Array.from({ length: n }, (_, q) => ({ nIdx, q, dur: CL_QUERY_MS[n] })),
  { nIdx, q: -1, dur: nIdx === SIZES.length - 1 ? 3200 : 1500 },
]);

export function ClassicalParityAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const lastStatus = useRef("");

  useCanvasLoop(
    stageRef,
    canvasRef,
    (w) => (w < 680 ? 1.8 : 0.66),
    totalMs(CL_SEGS),
    (ctx, W, H, colors, t) => {
      const { seg, local } = t < 0 ? { seg: CL_SEGS[CL_SEGS.length - 1], local: 1 } : locate(CL_SEGS, t);
      const n = SIZES[seg.nIdx];
      const hold = seg.q < 0;
      const run = hold ? n - 1 : seg.q;
      const p = hold ? -1 : Math.min(1, local / 0.85);
      const runDone = hold || p >= METER_P;
      const doneQueries = hold ? n : run + (runDone ? 1 : 0);

      const stacked = W < 680;
      const fs = Math.max(10, Math.min(15, (stacked ? W : W / 2) * 0.03));
      const lay = layout(W, H, fs, stacked, true);

      drawBanner(
        ctx,
        W,
        lay.bannerH,
        hold ? `n = ${n} bits → ${n} queries` : `n = ${n} bits · query ${run + 1} of ${n} · input x = ${unitMask(n, run)}`,
        fs,
        colors,
      );
      const timing = drawLogicPanel(ctx, lay.panels[0], n, run, p, colors, fs);
      drawReversiblePanel(ctx, lay.panels[1], n, run, p, colors, fs, timing);

      drawPanelBg(ctx, lay.strip, colors);
      drawRegister(ctx, lay.reg, n, Array.from({ length: n }, (_, i) => i < doneQueries), colors, fs);
      const used = SIZES.map((m, k) => (k < seg.nIdx ? m : k === seg.nIdx ? doneQueries : 0));
      drawScaling(ctx, lay.chart, used, seg.nIdx, false, colors, fs);

      const status =
        hold && seg.nIdx === SIZES.length - 1
          ? "Queries grow with n: 2 → 4 → 8. Same logic in reversible quantum gates: still one query per bit."
          : hold
            ? `n = ${n}: ${n} queries → s = ${secretFor(n).join("")}, parity = ${parityOf(secretFor(n))}`
            : `Query ${run + 1} of ${n}: x = ${unitMask(n, run)} → both circuits return f(x) = s${run}`;
      if (statusRef.current && status !== lastStatus.current) {
        statusRef.current.textContent = status;
        lastStatus.current = status;
      }
    },
  );

  const stageSize = "min(max(900px, 60vw), calc(100vw - 2rem), calc((100dvh - 26rem) * 1.5))";
  return (
    <div
      role="img"
      aria-label="Split screen: the parity function f(x) = x·s mod 2 built from classical AND and XOR gates on the left and, gate for gate, from reversible quantum gates on the right: one Toffoli per AND and one CNOT per XOR, with s as an input. For n = 2, 4 and 8 bits, both need one query per bit — 2, 4, then 8 queries — shown on a growing bar chart."
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>
      <div
        ref={statusRef}
        style={{
          width: stageSize,
          minHeight: "2.6em",
          textAlign: "center",
          fontSize: "0.88rem",
          color: "var(--cds-text-secondary)",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 12                                                            */
/* ------------------------------------------------------------------ */

// Column positions (fraction of the wire span) for the Bernstein–Vazirani circuit.
const BV_ANC_X = 0.05;
const BV_H1 = 0.15;
const BV_OR0 = 0.27;
const BV_OR1 = 0.69;
const BV_H2 = 0.8;

const QU_SWEEP_MS = 3000;
const QU_SEGS: Seg[] = SIZES.flatMap((_, nIdx) => [
  { nIdx, q: 0, dur: QU_SWEEP_MS },
  { nIdx, q: -1, dur: nIdx === SIZES.length - 1 ? 3200 : 1600 },
]);

function drawBVPanel(ctx: CanvasRenderingContext2D, R: Rect, n: number, p: number, colors: ExtendedColors, fs: number) {
  const s = secretFor(n);
  drawPanelBg(ctx, R, colors);
  drawPanelTitle(ctx, R, "Quantum oracle: superposition + phase kickback", fs, colors.text);

  const { ys, step } = rowLayout(R, n + 1, fs);
  const dataY = ys.slice(0, n);
  const ancY = ys[n];
  const box = Math.max(12, Math.min(28, step * 0.62));
  const cnotR = Math.max(5, box * 0.32);
  const rowFs = Math.max(8, Math.min(fs, Math.round(step * 0.42)));

  const labelX = R.x + R.w * 0.1;
  const sx0 = R.x + R.w * 0.12;
  const sx1 = R.x + R.w * 0.93;
  const wireEnd = R.x + R.w * 0.97;
  const prog2x = (q: number) => sx0 + (sx1 - sx0) * q;
  const reached = (q: number) => p < 0 || p >= q;
  const cnotP = (i: number) => BV_OR0 + ((i + 0.5) / n) * (BV_OR1 - BV_OR0);
  const curX = p < 0 ? wireEnd : prog2x(p);
  const xMeter = prog2x(METER_P);

  drawOracleFrame(
    ctx,
    prog2x(BV_OR0 - 0.03),
    prog2x(BV_OR1 + 0.03),
    dataY[0] - box * 0.75,
    ancY + box * 0.7,
    colors,
    p >= BV_OR0 && p <= BV_OR1,
    "Oracle U_f, s built in (Toffoli → CNOT where sᵢ = 1) — queried once",
    fs * 0.85,
  );

  for (let i = 0; i < n; i++) {
    const y = dataY[i];
    drawWire(ctx, sx0, wireEnd, y, colors.wire, 1.4);
    // Superposition (blue) from H1, turning gold where phase kickback lands.
    if (reached(BV_H1)) {
      const kick = s[i] === 1 && reached(cnotP(i)) ? prog2x(cnotP(i)) : null;
      const end = Math.min(prog2x(BV_H2), curX);
      strokePath(ctx, [[prog2x(BV_H1), y], [kick ?? end, y]], colors.gate, 2.4);
      if (kick !== null && end > kick) strokePath(ctx, [[kick, y], [end, y]], colors.state, 2.6);
    }
    if (reached(BV_H2) && s[i] === 1) strokePath(ctx, [[prog2x(BV_H2), y], [Math.min(xMeter, curX), y]], colors.state, 2.6);

    ctx.fillStyle = colors.textDim;
    ctx.font = mono(rowFs);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`q${i} |0⟩`, labelX, y);

    drawGateBox(ctx, prog2x(BV_H1), y, "H", box, { box: colors.box, gate: colors.gate, text: colors.text });
    drawGateBox(ctx, prog2x(BV_H2), y, "H", box, { box: colors.box, gate: colors.gate, text: colors.text });

    // Phase tag just after the oracle: |+⟩ or |−⟩.
    if (reached(BV_OR1) && box >= 14) {
      ctx.fillStyle = s[i] ? colors.state : colors.gate;
      ctx.font = mono(Math.round(rowFs * 0.85), true);
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(s[i] ? "|−⟩" : "|+⟩", (prog2x(BV_OR1 + 0.03) + prog2x(BV_H2)) / 2, y - 2);
    }
    drawMeterBox(ctx, xMeter, y, box, colors, reached(METER_P) ? String(s[i]) : null);
  }

  drawWire(ctx, sx0, wireEnd, ancY, colors.wire, 1.4);
  ctx.fillStyle = colors.text;
  ctx.font = mono(rowFs, true);
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("anc |0⟩", labelX, ancY);
  drawGateBox(ctx, prog2x(BV_ANC_X), ancY, "X", box, { box: colors.box, gate: colors.gate, text: colors.text });
  drawGateBox(ctx, prog2x(BV_H1), ancY, "H", box, { box: colors.box, gate: colors.gate, text: colors.text });
  if (reached(BV_H1)) {
    ctx.fillStyle = colors.textDim;
    ctx.font = mono(Math.round(rowFs * 0.85), true);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("|−⟩", (prog2x(BV_H1) + prog2x(BV_OR0)) / 2, ancY - 2);
  }

  for (let i = 0; i < n; i++) {
    if (s[i] !== 1) continue;
    const firing = p >= 0 && Math.abs(p - cnotP(i)) < 0.04;
    drawCNOT(ctx, prog2x(cnotP(i)), dataY[i], ancY, cnotR, firing || reached(cnotP(i)) ? colors.state : colors.gate);
  }

  if (p >= 0 && p <= 1) {
    drawPlayhead(ctx, prog2x(p), dataY[0] - box * 0.85, ancY + box * 0.85, colors.play, 0.9);
  }

  drawPanelCaption(ctx, R, "H on every wire · one U_f query (|−⟩ kicks phase back) · H again → read all of s", fs, colors.textDim);
}

export function QuantumParityAnimation() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const lastStatus = useRef("");

  useCanvasLoop(
    stageRef,
    canvasRef,
    (w) => (w < 680 ? 1.35 : 0.56),
    totalMs(QU_SEGS),
    (ctx, W, H, colors, t) => {
      const { seg, local } = t < 0 ? { seg: QU_SEGS[QU_SEGS.length - 1], local: 1 } : locate(QU_SEGS, t);
      const n = SIZES[seg.nIdx];
      const hold = seg.q < 0;
      const p = hold ? -1 : Math.min(1, local / 0.9);
      const measured = hold || p >= METER_P;

      const stacked = W < 680;
      const fs = Math.max(10, Math.min(15, W * (stacked ? 0.03 : 0.016)));
      const lay = layout(W, H, fs, stacked, false);

      drawBanner(ctx, W, lay.bannerH, `n = ${n} bits · 1 query`, fs, colors);
      drawBVPanel(ctx, lay.panels[0], n, p, colors, fs);

      drawPanelBg(ctx, lay.strip, colors);
      drawRegister(ctx, lay.reg, n, Array.from({ length: n }, () => measured), colors, fs);
      const used = SIZES.map((_, k) => (k < seg.nIdx || (k === seg.nIdx && measured) ? 1 : 0));
      drawScaling(ctx, lay.chart, used, seg.nIdx, true, colors, fs);

      const status =
        hold && seg.nIdx === SIZES.length - 1
          ? "Classical: one query per bit (dashed). Quantum oracle: 1 query at every n."
          : hold
            ? `n = ${n}: 1 query → s = ${secretFor(n).join("")}, parity = ${parityOf(secretFor(n))}`
            : p < BV_OR0
              ? "Superposition: H on every input wire, ancilla in |−⟩…"
              : p < BV_OR1
                ? "One oracle query: each CNOT kicks a −1 phase onto wires with sᵢ = 1…"
                : "Interference: H turns |−⟩ → |1⟩ and |+⟩ → |0⟩ — every bit of s at once";
      if (statusRef.current && status !== lastStatus.current) {
        statusRef.current.textContent = status;
        lastStatus.current = status;
      }
    },
  );

  const stageSize = "min(max(900px, 60vw), calc(100vw - 2rem), calc((100dvh - 26rem) * 1.75))";
  return (
    <div
      role="img"
      aria-label="Bernstein–Vazirani circuit for n = 2, 4 and 8 bits: Hadamards, the same CNOT oracle queried once with the ancilla in |−⟩, Hadamards again, then all n bits of s are measured at once. The bar chart stays at 1 query for every n, against dashed outlines of the classical 2, 4 and 8."
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", color: "var(--cds-text-primary)" }}
    >
      <div ref={stageRef} style={{ position: "relative", width: stageSize }}>
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>
      <div
        ref={statusRef}
        style={{
          width: stageSize,
          minHeight: "2.6em",
          textAlign: "center",
          fontSize: "0.88rem",
          color: "var(--cds-text-secondary)",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      />
    </div>
  );
}

/**
 * Legacy `parity` registry entry: renders the quantum view on `?slide=12`,
 * the classical view otherwise.
 */
export function ParityAnimation() {
  const searchParams = useSearchParams();
  const slideParam = Number(searchParams?.get("slide") ?? "11");
  return slideParam === 12 ? <QuantumParityAnimation /> : <ClassicalParityAnimation />;
}

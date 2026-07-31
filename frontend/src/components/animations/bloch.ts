/**
 * Minimal dependency-free 3D helper for Bloch-sphere animations.
 *
 * Real 3×3 rotation matrices + a fixed orthographic camera, so a quantum state
 * is a true 3D unit vector and a gate is a single clean rotation of it. The
 * "3D" look comes from the fixed camera angle, not from coupling screen-axis
 * transforms. Shared by the qubit / superposition / entanglement animations.
 *
 * Bloch axes (world): X = right (|+⟩), Y = up (|0⟩ pole), Z = toward viewer.
 */

export type Vec3 = [number, number, number];
export type Mat3 = [number, number, number, number, number, number, number, number, number];

const rad = (deg: number) => (deg * Math.PI) / 180;

export function rotX(deg: number): Mat3 {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [1, 0, 0, 0, c, -s, 0, s, c];
}
export function rotY(deg: number): Mat3 {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}
export function rotZ(deg: number): Mat3 {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}
export function mul(a: Mat3, b: Mat3): Mat3 {
  const m = new Array(9) as unknown as Mat3;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      m[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return m;
}
export function apply(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

export interface Camera {
  view: Mat3;
  radius: number;
  cx: number;
  cy: number;
}

/** Fixed camera: azimuth (about vertical) then elevation (tilt from above). */
export function makeCamera(azimuthDeg: number, elevationDeg: number, radius: number, cx: number, cy: number): Camera {
  return { view: mul(rotX(elevationDeg), rotY(azimuthDeg)), radius, cx, cy };
}

/** Project a unit-sphere point to screen; `depth` > 0 means toward the viewer. */
export function project(v: Vec3, cam: Camera): { x: number; y: number; depth: number } {
  const p = apply(cam.view, v);
  return { x: cam.cx + p[0] * cam.radius, y: cam.cy - p[1] * cam.radius, depth: p[2] };
}

export interface SphereColors {
  silhouette: string;
  wire: string;
  fillInner: string;
  fillOuter: string;
}

/** Depth-shaded great circle: front arcs brighter, back arcs dimmer. */
function drawGreatCircle(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  pointFn: (t: number) => Vec3,
  color: string,
  segments = 72,
) {
  for (let i = 0; i < segments; i++) {
    const a = project(pointFn((i / segments) * Math.PI * 2), cam);
    const b = project(pointFn(((i + 1) / segments) * Math.PI * 2), cam);
    const depth = (a.depth + b.depth) / 2; // -1 (back) .. 1 (front)
    ctx.globalAlpha = 0.12 + ((depth + 1) / 2) * 0.4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Draw the shaded sphere: ball gradient, silhouette, equator + two meridians. */
export function drawSphere(ctx: CanvasRenderingContext2D, cam: Camera, colors: SphereColors) {
  const { cx, cy, radius } = cam;

  const grad = ctx.createRadialGradient(
    cx - radius * 0.35, cy - radius * 0.4, radius * 0.1,
    cx, cy, radius,
  );
  grad.addColorStop(0, colors.fillInner);
  grad.addColorStop(1, colors.fillOuter);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = colors.silhouette;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  drawGreatCircle(ctx, cam, (t) => [Math.cos(t), 0, Math.sin(t)], colors.wire); // equator (X-Z)
  drawGreatCircle(ctx, cam, (t) => [Math.cos(t), Math.sin(t), 0], colors.wire); // meridian (X-Y)
  drawGreatCircle(ctx, cam, (t) => [0, Math.cos(t), Math.sin(t)], colors.wire); // meridian (Y-Z)
}

/** Draw a state vector (arrow) from the centre to `dir`; dims when behind. */
export function drawVector(
  ctx: CanvasRenderingContext2D,
  dir: Vec3,
  cam: Camera,
  color: string,
  width = 2.5,
) {
  const tip = project(dir, cam);
  ctx.globalAlpha = tip.depth < 0 ? 0.4 : 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cam.cx, cam.cy);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();

  const ang = Math.atan2(tip.y - cam.cy, tip.x - cam.cx);
  const h = 9;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x - h * Math.cos(ang - 0.4), tip.y - h * Math.sin(ang - 0.4));
  ctx.lineTo(tip.x - h * Math.cos(ang + 0.4), tip.y - h * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cam.cx, cam.cy, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Draw a text label just outside the sphere at direction `dir`. */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  dir: Vec3,
  cam: Camera,
  text: string,
  color: string,
  font: string,
) {
  const outer = project([dir[0] * 1.16, dir[1] * 1.16, dir[2] * 1.16], cam);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, outer.x, outer.y);
}

/** Parse "#rrggbb" or "rgb(r, g, b)" to [r, g, b]. */
export function parseColor(value: string, fallback: Vec3): Vec3 {
  const v = value.trim();
  if (v.startsWith("#")) {
    const n = parseInt(v.slice(1), 16);
    return v.length >= 7 ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : fallback;
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((s) => parseFloat(s));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  }
  return fallback;
}

/** Linear blend of two RGB triples → "rgb(r, g, b)". */
export function mixColor(a: Vec3, b: Vec3, t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

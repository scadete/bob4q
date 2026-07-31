"use client";

/**
 * ANIM-01 — Qubit / Bloch sphere (3D).
 *
 * CSS/JS reimplementation of manim/scenes/qubit.py (QubitScene). A slim state
 * vector on a shaded 3D Bloch sphere loops:
 *   |0⟩ (north pole) → Hadamard tips it to the equator → precesses around the
 *   equator (superposition) → tips down to |1⟩ (south pole).
 *
 * Pure CSS 3D transforms under `perspective` (no libraries); colors use Carbon
 * tokens. The transform angles/opacity are visually tuned. With
 * `prefers-reduced-motion` the animation is disabled and a clean |+⟩ still-frame
 * (with 50/50 bars) is shown instead.
 */

const css = `
.qa-root {
  --qa-dur: 10s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  color: var(--cds-text-primary);
}
.qa-stage { position: relative; width: min(340px, 80vw); aspect-ratio: 1; perspective: 760px; }
.qa-ball { position: absolute; inset: 0; width: 100%; height: 100%; }

/* Slim state vector: base pinned at the sphere centre, points up by default. */
.qa-vec {
  position: absolute;
  left: 50%;
  bottom: 50%;
  margin-left: -1.5px;
  width: 3px;
  height: 38%;
  border-radius: 2px;
  background: currentColor;
  transform-origin: 50% 100%;
  /* Reduced-motion still-frame: |+⟩ pointing right on the equator. */
  transform: rotate(90deg);
  color: var(--cds-support-warning);
}
.qa-vec::before {
  content: "";
  position: absolute;
  top: -8px;
  left: 50%;
  margin-left: -4px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 8px solid currentColor;
}

.qa-bars {
  position: absolute; top: 8%; right: 1%;
  display: flex; flex-direction: column; gap: 6px;
  opacity: 1;
}
.qa-barRow { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; color: var(--cds-text-secondary); }
.qa-barTrack { width: 54px; height: 8px; background: var(--cds-layer-02, #393939); border-radius: 2px; overflow: hidden; }
.qa-barFill { display: block; height: 100%; width: 50%; }
.qa-barFill0 { background: var(--cds-support-info); }
.qa-barFill1 { background: var(--cds-support-error); margin-left: 50%; }

.qa-caption { position: relative; height: 1.4rem; width: min(340px, 80vw); text-align: center; }
.qa-cap { position: absolute; inset: 0; font-size: 0.9rem; color: var(--cds-text-secondary); }
.qa-cap1, .qa-cap3 { opacity: 0; }
.qa-cap2 { opacity: 1; }

@media (prefers-reduced-motion: no-preference) {
  .qa-vec {
    animation: qa-vec var(--qa-dur) infinite ease-in-out,
               qa-veccolor var(--qa-dur) infinite ease-in-out,
               qa-vecdim var(--qa-dur) infinite ease-in-out;
  }
  .qa-bars { animation: qa-bars var(--qa-dur) infinite ease-in-out; }
  .qa-cap1 { animation: qa-cap1 var(--qa-dur) infinite; }
  .qa-cap2 { animation: qa-cap2 var(--qa-dur) infinite; }
  .qa-cap3 { animation: qa-cap3 var(--qa-dur) infinite; }
}

/* Angle sweep: up → tip forward to equator → precess (rotateY) → down to |1⟩. */
@keyframes qa-vec {
  0%, 6%    { transform: rotateY(0deg)    rotateX(0deg); }
  15%, 19%  { transform: rotateY(0deg)    rotateX(-90deg); }
  44%       { transform: rotateY(-300deg) rotateX(-90deg); }
  48%, 50%  { transform: rotateY(-360deg) rotateX(-90deg); }
  62%, 74%  { transform: rotateY(-360deg) rotateX(-180deg); }
  90%, 100% { transform: rotateY(-360deg) rotateX(-360deg); }
}
@keyframes qa-veccolor {
  0%, 6%    { color: var(--cds-support-error); }
  15%       { color: var(--cds-support-warning); }
  50%       { color: var(--cds-support-warning); }
  62%, 74%  { color: var(--cds-support-error); }
  90%, 100% { color: var(--cds-support-error); }
}
/* Fake depth: dim while the vector is on the far side of the equator orbit. */
@keyframes qa-vecdim {
  0%, 24%   { opacity: 1; }
  30%, 36%  { opacity: 0.35; }
  42%, 100% { opacity: 1; }
}
@keyframes qa-bars {
  0%, 18%   { opacity: 0; }
  24%, 46%  { opacity: 1; }
  52%, 100% { opacity: 0; }
}
@keyframes qa-cap1 { 0%, 12% { opacity: 1; } 16%, 100% { opacity: 0; } }
@keyframes qa-cap2 { 0%, 16% { opacity: 0; } 20%, 48% { opacity: 1; } 52%, 100% { opacity: 0; } }
@keyframes qa-cap3 { 0%, 58% { opacity: 0; } 62%, 74% { opacity: 1; } 78%, 100% { opacity: 0; } }
`;

export function QubitAnimation() {
  return (
    <div
      className="qa-root"
      role="img"
      aria-label="A qubit state vector on a 3D Bloch sphere rotating from |0⟩ through superposition to |1⟩"
    >
      <div className="qa-stage">
        {/* Shaded 3D Bloch sphere: gradient ball, equator + meridian, axis, labels */}
        <svg className="qa-ball" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <radialGradient id="qaBallShade" cx="38%" cy="30%" r="78%">
              <stop offset="0%" stopColor="var(--cds-layer-02)" stopOpacity="0.9" />
              <stop offset="65%" stopColor="var(--cds-layer-01)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--cds-background)" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <line x1="120" y1="16" x2="120" y2="224" stroke="var(--cds-border-subtle)" strokeWidth="1" strokeOpacity="0.5" />
          <circle cx="120" cy="120" r="90" fill="url(#qaBallShade)" stroke="var(--cds-border-strong)" strokeWidth="1.5" />
          <ellipse cx="120" cy="120" rx="90" ry="28" fill="none" stroke="var(--cds-border-subtle)" strokeWidth="1" />
          <ellipse cx="120" cy="120" rx="28" ry="90" fill="none" stroke="var(--cds-border-subtle)" strokeWidth="1" strokeOpacity="0.6" />
          <text x="120" y="13" textAnchor="middle" fontSize="15" fill="var(--cds-text-primary)">|0⟩</text>
          <text x="120" y="238" textAnchor="middle" fontSize="15" fill="var(--cds-text-primary)">|1⟩</text>
          <text x="228" y="125" textAnchor="middle" fontSize="14" fill="var(--cds-support-warning)">|+⟩</text>
        </svg>

        {/* Slim rotating state vector (3D) */}
        <div className="qa-vec" aria-hidden="true" />

        {/* Measurement probabilities (visible during superposition) */}
        <div className="qa-bars" aria-hidden="true">
          <div className="qa-barRow">
            <span>|0⟩</span>
            <span className="qa-barTrack"><span className="qa-barFill qa-barFill0" /></span>
            <span>50%</span>
          </div>
          <div className="qa-barRow">
            <span>|1⟩</span>
            <span className="qa-barTrack"><span className="qa-barFill qa-barFill1" /></span>
            <span>50%</span>
          </div>
        </div>
      </div>

      <div className="qa-caption">
        <span className="qa-cap qa-cap1">Classical bit — always |0⟩ or |1⟩</span>
        <span className="qa-cap qa-cap2">H gate → superposition on the equator</span>
        <span className="qa-cap qa-cap3">Measurement collapses to |0⟩ or |1⟩</span>
      </div>

      <style>{css}</style>
    </div>
  );
}

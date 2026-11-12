# manim/ — animation reference specs

The `.py` files in `scenes/` are **reference specs written in Manim's API**.
They are **never installed, rendered, or executed**. This folder has no
`pyproject.toml` on purpose: installing Manim would require system Pango/Cairo
dev libraries on every workshop machine.

Each scene describes *what an animation should show*. The actual animation is a
**CSS/JS React component** in `frontend/src/components/animations/`,
registered in `frontend/src/lib/animations.ts`.

## Workflow for a new animation

1. **Write the spec.** Draft `scenes/<name>.py` as a Manim `Scene`. Use it to
   pin down the objects, their order, the timing, and the narration text.
   Its imports don't need to resolve.
2. **Validate the concept** with the user before building anything.
3. **Build the component** `frontend/src/components/animations/<Name>Animation.tsx`
   and add a docblock that starts with `Reference: manim/scenes/<name>.py`.
4. **Register it** in the `animations` map in `frontend/src/lib/animations.ts`
   (add the key to `AnimationName`).

## Translating a scene into a component

Treat the scene as a storyboard, not a frame-by-frame script. Keep the concept
and the order of beats. Adapt the details where an interactive web component
can show the idea better (for example, a looping measurement tally instead of a
one-shot reveal).

| Manim | Web equivalent |
|---|---|
| `Scene.construct()` sequence of `self.play(...)` | A timeline of phases (fractions of a cycle, or CSS keyframes) driven by `requestAnimationFrame` or CSS animations |
| `run_time=x`, `self.wait(x)` | Phase durations in ms, kept roughly proportional |
| `Create`, `Write`, `GrowArrow` | Stroke-dash reveal, width/scale from 0, or progressive canvas drawing |
| `FadeIn` / `FadeOut` (`shift=`) | `opacity` + `transform: translate(...)` |
| `Transform(a, b)` | Interpolate between the two states (position, angle, color) |
| `Circle`, `Line`, `Arrow`, `Square`, `VGroup` | Canvas 2D or SVG primitives. Reuse the shared helpers `bloch.ts` (3D Bloch sphere) and `circuit.ts` (circuit wires/gates) |
| `MathTex` | KaTeX, or Unicode kets (`|0⟩`, `|+⟩`) for small labels |
| `Text(...)` narration | i18n strings from `frontend/messages/{locale}.json`, never hardcoded |
| Colors (`BLUE`, `YELLOW`, `GRAY`, …) | Carbon tokens (CSS custom properties, read via `getComputedStyle` for canvas). Never hex values |

## Required in every component

- Animate only GPU-friendly properties (`transform`, `opacity`) or a single
  canvas redraw per frame.
- Honor `prefers-reduced-motion` by showing a meaningful static frame.
- Use named exports only, strict TypeScript, and no `any`.

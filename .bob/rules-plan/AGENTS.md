# AGENTS.md — Plan Mode

## Non-obvious architectural constraints for bob4q

### Hard constraints
- Qiskit Code Assistant = local model ONLY → any feature requiring it must account for cold-start latency (~5-30s model load)
- Animations = CSS/JS React components (no Manim render, no video); `manim/scenes/*.py` is reference-only. Validate each animation concept with the user before building it.
- MCP server MUST support both stdio (Bob local) AND HTTP SSE (container/remote) — these are not separate codebases

### Coupling to watch
- Adding an animation requires: a CSS/JS React component + an entry in `frontend/src/lib/animations.ts` (optionally a `manim/scenes/*.py` reference) — no render/copy step
- New MCP tool requires: `server.py` registration + FastAPI backend endpoint that invokes it + frontend lab UI binding
- New workshop module requires: docs in BOTH `docs/i18n/en/` AND `docs/i18n/pt-BR/` + route in Next.js + navigation update

### Deployment topology
- Container runtime: Podman (preferred, rootless) or Docker (fallback) — same compose file, scripts auto-detect
- Windows participants use Podman Desktop (WSL2 backend) — setup via `scripts\setup-container.ps1`
- Workshop participants: EITHER full `podman compose up` OR manual (pnpm + uv per package) — both paths must stay working
- Container image for MCP server must be self-contained (model bundled or model pulled on first start — TBD)

### Carbon DS constraints
- All visual design decisions must use Carbon tokens — custom CSS is a last resort and must be documented
- No external UI libraries alongside Carbon (no MUI, no Tailwind) — increases bundle and breaks Carbon theme consistency

### i18n planning
- Every user-facing string added to UI = add to ALL locale files immediately (not later)
- Workshop docs must be translated before a module is marked "ready"
- Starting locales: `en`, `pt-BR` — design routing to make adding new locales zero-code

### Performance
- Animations are CSS/JS components (no video payloads) — keep them GPU-friendly (transform/opacity) and respect `prefers-reduced-motion`
- Qiskit simulator is fast; real QPU adds queue latency — UI must handle async job polling

# AGENTS.md — Plan Mode

## Non-obvious architectural constraints for bob4q

### Hard constraints
- Qiskit Code Assistant = local model ONLY → any feature requiring it must account for cold-start latency (~5-30s model load)
- Manim = pre-render ONLY for production → no on-demand rendering in live demo path
- MCP server MUST support both stdio (Bob local) AND HTTP SSE (container/remote) — these are not separate codebases

### Coupling to watch
- Adding a Manim scene requires: new `.py` file in `manim/scenes/` + entry in `frontend/src/lib/animations.ts` + render + copy to `frontend/public/videos/` — all four steps are coupled
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
- Manim video files can be large — plan for CDN or compression before workshop scale
- Qiskit simulator is fast; real QPU adds queue latency — UI must handle async job polling

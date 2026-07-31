# AGENTS.md — Ask Mode

## Non-obvious context for answering questions about bob4q

### Container runtime
- Project uses **Podman**, not Docker — same compose file works with both but Podman is the default
- Scripts auto-detect: `podman` first, fall back to `docker compose`
- Windows path: Podman Desktop (WSL2 backend) → `scripts\setup-container.ps1`
- "Docker Compose" references in older docs should be read as "Podman Compose"

### Cross-platform scripts
- `scripts/*.sh` → macOS + Linux
- `scripts/*.ps1` → Windows PowerShell (no admin required)
- Both do the same thing — local setup and container setup

### Counterintuitive structure
- `manim/` contains Python animation source used as a **reference spec** — animations are reimplemented as CSS/JS React components, NOT rendered to video
- `docs/i18n/` is workshop Markdown documentation, separate from `frontend/messages/` which is UI strings
- MCP server is NOT a standard REST API — it uses MCP protocol (stdio or HTTP SSE), not regular HTTP JSON

### Two i18n systems (not one)
- `frontend/messages/` → UI strings consumed by `next-intl`
- `docs/i18n/{locale}/` → workshop content consumed by Next.js MDX/Markdown route
- They are independent and both must be maintained

### Qiskit Code Assistant constraint
- It is NOT a cloud API — it is a local model running via llama-cpp/ollama
- No API key for it; it runs as a subprocess inside the MCP server
- IBM Quantum backends (simulators, real QPUs) DO require API keys — separate concern

### MCP Server dual-role
- In local dev: Bob spawns `server.py` as subprocess (stdio transport)
- In workshop/container: server runs with `--http` flag as a standalone process
- Same codebase, different entry point

### Carbon DS in this project
- This is NOT a carbon-components-react project — uses `@carbon/react` (v11+)
- Dark theme `g100` is default for the lab/demo UI
- Presenter/demo mode uses full-screen Carbon layout (details TBD)

### Where to find things
- Architecture decisions: `MEMORY-ARCH.md`
- Workshop content decisions: `MEMORY-WORKSHOP.md`
- MCP tool registry: `mcp-server/server.py` + `MEMORY-MCP.md`
- Animation scene registry: `frontend/src/lib/animations.ts`

# AGENTS.md — Agent (Coding) Mode

## Non-obvious coding rules for bob4q

### MCP Server
- `server.py` MUST handle both stdio and HTTP transport in one file — use `--http` argparse flag to switch
- When adding a new MCP tool, register it in both `mcp-server/server.py` AND update `MEMORY-MCP.md`
- Qiskit Code Assistant invocation is subprocess-based (local model), NOT an async HTTP call

### Frontend
- Import Carbon components from `@carbon/react` only — NEVER `carbon-components-react`
- Animation component `<QuantumAnimation>` expects `sceneName` which maps via `frontend/src/lib/animations.ts` — update that file when adding Manim scenes
- `next-intl` namespaces are top-level keys in `frontend/messages/{locale}.json` — add to ALL locale files simultaneously
- No default exports except Next.js page/layout files

### Python packages
- Each of `mcp-server/`, `backend/`, `manim/` has isolated `uv` env — never run `uv` from repo root for these
- Use `ruff check . && ruff format .` before committing Python — configured per-package

### Manim
- Render with `-ql` (low quality) during dev, `-qh` only for final assets
- Output path must be copied to `frontend/public/videos/` — automate via `scripts/render-all.sh`

### Testing
- Python: `uv run pytest tests/test_specific.py` from the package directory
- JS: `pnpm test <path/to/file.test.ts>` from `frontend/`

### Memory
- Update relevant `MEMORY-*.md` file after any architectural or tool decision
- Always update `MEMORY.md` status checklist when a milestone is completed

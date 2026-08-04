# AGENTS.md — Agent (Coding) Mode

## Non-obvious coding rules for bob4q

### Cross-platform
- Shell scripts (`scripts/*.sh`) → POSIX sh (macOS + Linux); Windows equivalents in `scripts/*.ps1`
- Never use `docker` directly in code or scripts — use auto-detect pattern: check `podman` first, fall back to `docker`
- Path separators: use `/` in code; only `\` in Windows `.ps1` user-facing messages
- `cp -n` (no-clobber) has no native Windows equivalent — `.ps1` scripts use `Test-Path` guard instead

### MCP Server
- `server.py` MUST handle both stdio and HTTP transport in one file — use `--http` argparse flag to switch
- When adding a new MCP tool, register it in both `mcp-server/server.py` AND update `MEMORY-MCP.md`
- Qiskit Code Assistant invocation is subprocess-based (local model), NOT an async HTTP call

### Frontend
- Import Carbon components from `@carbon/react` only — NEVER `carbon-components-react`
- Animations are CSS/JS React components registered in `frontend/src/lib/animations.ts` (keyed by `AnimationName`) — NOT rendered video; `manim/scenes/*.py` is the reference spec. Validate each animation's concept with the user before building it.
- `next-intl` namespaces are top-level keys in `frontend/messages/{locale}.json` — add to ALL locale files simultaneously
- No default exports except Next.js page/layout files

### Python packages
- Each of `mcp-server/`, `manim/` has isolated `uv` env — never run `uv` from repo root for these; notebooks have no dedicated env, deps declared per-notebook via `uv run --with ...`
- Use `ruff check . && ruff format .` before committing Python — configured per-package

### Animations
- CSS/JS React components only — no Manim render, no video files
- `manim/scenes/*.py` are read as the visual reference spec; register components in `frontend/src/lib/animations.ts`

### Testing
- Python: `uv run pytest tests/test_specific.py` from the package directory
- JS: `pnpm test <path/to/file.test.ts>` from `frontend/`

### Memory
- Update relevant `MEMORY-*.md` file after any architectural or tool decision
- Always update `MEMORY.md` status checklist when a milestone is completed

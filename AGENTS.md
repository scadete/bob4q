# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project
**Quantum Experience Lab** — full-stack workshop demo integrating IBM Bob + Qiskit MCP servers into an end-to-end quantum development workflow. Target: workshop participants on fresh machines or containers.

## Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + Carbon Design System (`@carbon/react`) |
| Math/Animations | Manim (Python) — pre-rendered to video/SVG, served statically |
| Backend/API | FastAPI (Python) — quantum circuit execution, Manim render jobs |
| MCP Server | Custom Python MCP server wrapping Qiskit — runnable locally or in Podman |
| i18n | `next-intl` — locale files in `frontend/messages/{locale}.json` |
| Package mgr (JS) | pnpm (workspaces) |
| Package mgr (Py) | uv (per Python package) |
| Container | Podman Compose (Docker Compose compatible) — see `docker/` |

## Commands

### Frontend (run from `frontend/`)
```bash
pnpm dev          # dev server :3000
pnpm build        # production build
pnpm lint         # ESLint
pnpm test         # vitest
pnpm test <file>  # single test file
```

### MCP Server (run from `mcp-server/`)
```bash
uv run server.py          # local stdio MCP server
uv run server.py --http   # HTTP transport for remote/demo use
podman compose up mcp     # containerized (Docker Compose works too)
```

### Backend API (run from `backend/`)
```bash
uv run uvicorn main:app --reload   # dev server :8000
uv run pytest                      # all tests
uv run pytest tests/test_foo.py    # single test
```

### Manim (run from `manim/`)
```bash
uv run manim render scenes/qubit.py QubitScene -ql  # low quality (fast, dev)
uv run manim render scenes/qubit.py QubitScene -qh  # high quality (prod)
# Output → manim/media/videos/ — copy to frontend/public/videos/
```

### JupyterLite (run from repo root)
```bash
sh scripts/build-jupyterlite.sh   # build JupyterLite → frontend/public/jupyterlite/
# Requires only: uv — packages are fetched on demand via uv run --with
```

### Root
```bash
podman compose up          # full stack (recommended)
podman compose up --build  # force rebuild
docker compose up          # Docker fallback — same compose file
```

### Windows (PowerShell)
```powershell
.\scripts\setup.ps1            # local mode setup
.\scripts\setup-container.ps1  # container mode setup
.\scripts\build-jupyterlite.ps1 # build JupyterLite static bundle
podman compose up
```

## Critical Patterns

### JupyterLite → Frontend pipeline
JupyterLite is a **pre-built** static site (not built at Next.js build time). Run `scripts/build-jupyterlite.sh` once after cloning, or whenever notebooks change. Output goes to `frontend/public/jupyterlite/`. The `/lab` route embeds it in an iframe via `<LabEmbed>`.
- **Aer-wasm is NOT available in Pyodide** — the in-browser kernel uses `qiskit.primitives.StatevectorSampler`
- For Aer / real QPU: use the "Run on QPU" button → FastAPI backend
- COOP/COEP headers (required by SharedArrayBuffer/Pyodide) are set in `frontend/next.config.ts`

### MCP Server transport duality
`mcp-server/server.py` supports `--http` flag → switches from stdio (local Bob integration) to HTTP SSE (remote/demo). Bob config differs per mode — see `docs/setup/bob-config.md`.

### Manim → Frontend pipeline
Manim videos are **pre-rendered** (not on-the-fly). Render → copy to `frontend/public/videos/`. The `<QuantumAnimation>` component in `frontend/src/components/` takes a `sceneName` prop that maps to filenames via `frontend/src/lib/animations.ts`.

### Carbon Design System
Always import from `@carbon/react`, never `carbon-components-react`. Use Carbon tokens for all colors/spacing — no hardcoded hex values except in Manim Python code.

### i18n — two separate systems
- `frontend/messages/` → Next.js UI strings (via `next-intl`)
- `docs/i18n/` → Workshop documentation (Markdown, one folder per locale)
Both must be updated together when adding user-facing content.

### Qiskit Code Assistant (local model only)
Qiskit Code Assistant runs only as a local model (no cloud API). The MCP server wraps it via subprocess. For workshops: participants either run locally or pull the pre-built container image `ghcr.io/YOUR_ORG/bob4q-mcp:latest` via Podman or Docker.

### Python env isolation
Each Python package (`mcp-server/`, `backend/`, `manim/`) has its own `pyproject.toml` + `uv.lock`. Never share venvs across packages.

## Code Style

### TypeScript/JavaScript
- Strict TypeScript (`"strict": true`) — no `any`
- Named exports only (no default exports except Next.js pages/layouts)
- `zod` for all runtime validation at API boundaries
- File naming: `kebab-case.ts`, component files: `PascalCase.tsx`

### Python
- Type hints required on all public functions
- `ruff` for linting + formatting (configured in each `pyproject.toml`)
- Async FastAPI handlers throughout; use `httpx.AsyncClient` not `requests`

## Repo Layout
```
bob4q/
├── frontend/          # Next.js app
├── backend/           # FastAPI quantum API
├── mcp-server/        # Qiskit MCP server (stdio + HTTP)
├── manim/             # Animation scenes (Python)
├── docs/              # Workshop docs (i18n Markdown)
├── docker/            # Dockerfiles + compose
└── scripts/           # Setup helpers for workshop participants
```

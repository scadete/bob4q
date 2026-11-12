# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project
**Quantum Experience Lab** — full-stack workshop demo integrating IBM Bob + Qiskit MCP servers into an end-to-end quantum development workflow. Target: workshop participants on fresh machines or containers.

## Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + Carbon Design System (`@carbon/react`) |
| Math/Animations | CSS/JS React components (Manim scenes in `manim/` are the reference spec, not rendered) |
| Circuit execution | Qiskit, run in-process inside each notebook (`notebooks/lib/backend.py`) — no server |
| MCP Server | Custom Python MCP server wrapping the local Qiskit Code Assistant (Granite via Ollama) — stdio or HTTP |
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

### Animations
Animations are **CSS/JS React components**, not rendered Manim video. The
`manim/scenes/*.py` files are reference specs written in Manim's API (read them,
never install or render them; `manim/` has no `pyproject.toml` on purpose).
Workflow for a new animation: write/approve a spec scene in `manim/scenes/` →
validate the concept with the user → build the component and register it in
`frontend/src/lib/animations.ts`. Translation rules (Manim → CSS/JS, colors →
Carbon tokens) are in `manim/README.md`.

### Notebooks (run locally from repo root)
```bash
# Notebooks live in notebooks/ and run locally in Jupyter (not in the browser).
uv run --with jupyterlab --with qiskit --with matplotlib --with pylatexenc --with httpx \
  jupyter lab notebooks/01-hello-quantum-with-bob.ipynb
# The /lab route presents them read-only; the "Run locally" panel shows this command.
# Notebook 04 also includes --with qiskit-aer --with qiskit-ibm-runtime for the real-QPU path.
# See each notebook's intro cell for its exact command.
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
podman compose up
```

## Critical Patterns

### Notebooks → `/lab` presentation
Notebooks in `notebooks/` are **run locally** by developers (not in the browser). The `/lab` route presents them read-only: `src/lib/notebooks.ts` is the registry + loader (reads `../notebooks/*.ipynb`), `/lab` lists them, `/lab/[slug]` renders markdown cells (KaTeX-aware, via `remark()` → `remark-rehype` → `rehype-katex`) and code cells as `<pre>` blocks, with a "Run locally" panel showing the `uv run … jupyter lab` command.
- Add a notebook: drop the `.ipynb` in `notebooks/`, add an entry to `NOTEBOOKS` in `src/lib/notebooks.ts`, and add its title/description under `notebooks.<slug>` in every `frontend/messages/{locale}.json`
- Notebook translations are separate files beside the English one: `notebooks/<slug>.<locale>.ipynb` (e.g. `01-quantum-fundamentals.pt-BR.ipynb`; same folder so the `lib/` import works). `/{locale}/lab/[slug]` picks the localized file and falls back to English with a notice. Keep code cells in sync between language versions — only prose, comments, and printed strings differ
- Notebooks use `qiskit.primitives.StatevectorSampler` (no Aer dependency); classical register is named `c`, so read counts via `result[0].data.c`

### MCP Server transport duality
`mcp-server/server.py` supports `--http` flag → switches from stdio (local Bob integration) to HTTP SSE (remote/demo). Bob config differs per mode — see `docs/setup/bob-config.md`.

### Animations → Frontend
No video pipeline. Each scene is a CSS/JS React component registered in
`frontend/src/lib/animations.ts` (`animations` map, keyed by `AnimationName`).
`SlideShow` looks up the component by the slide's `animation` key and renders it
(showing a placeholder for names not yet built). The `manim/scenes/*.py` files
are the visual reference only.

### Carbon Design System
Always import from `@carbon/react`, never `carbon-components-react`. Use Carbon tokens for all colors/spacing — no hardcoded hex values.

### i18n — two separate systems
- `frontend/messages/` → Next.js UI strings (via `next-intl`), including all slide copy (`slides.<id>.title/body`; `demo/page.tsx` only holds slide ids + animations) and notebook titles/descriptions (`notebooks.<slug>`)
- `docs/i18n/` → Workshop documentation (Markdown, one folder per locale)
- `notebooks/<slug>.<locale>.ipynb` → translated notebooks (see Notebooks above)
Both must be updated together when adding user-facing content. Locales are defined in `frontend/src/i18n/config.ts`; `LocaleSwitcher` swaps the `/[locale]` path segment on any page.

### Qiskit Code Assistant (local model only)
Qiskit Code Assistant runs only as a local model (no cloud API), served via Ollama. The MCP server's sole purpose is to wrap it (tool: `explain_circuit`) — it does not execute circuits. Circuit execution and backend listing (`run_via_backend`, `list_backends`) live in `notebooks/lib/backend.py` and run in-process inside each notebook's own kernel, not behind any server. For workshops: participants either run the MCP server locally or pull the pre-built container image `ghcr.io/YOUR_ORG/bob4q-mcp:latest` via Podman or Docker.

### Python env isolation
The only Python package is `mcp-server/`, with its own `pyproject.toml` + `uv.lock`. `manim/` is spec-only and has no env. Notebooks have no dedicated pyproject — their deps are declared per-notebook via `uv run --with ...` (see each notebook's intro cell). Never share venvs across packages.

## Code Style

### TypeScript/JavaScript
- Strict TypeScript (`"strict": true`) — no `any`
- Named exports only (no default exports except Next.js pages/layouts)
- `zod` for all runtime validation at API boundaries
- File naming: `kebab-case.ts`, component files: `PascalCase.tsx`

### Python
- Type hints required on all public functions
- `ruff` for linting + formatting (configured in each `pyproject.toml`)
- Async handlers for I/O in the MCP server; use `httpx.AsyncClient` not `requests`

## Repo Layout
```
bob4q/
├── frontend/          # Next.js app
├── mcp-server/        # Qiskit MCP server (stdio + HTTP)
├── manim/             # Animation reference specs (Manim API, never rendered)
├── docs/              # Workshop docs (i18n Markdown)
├── docker/            # Dockerfiles + compose
└── scripts/           # Setup helpers for workshop participants
```

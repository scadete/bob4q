# BACKLOG.md

Items are **ready** when all unknowns are resolved and acceptance criteria are clear.

**Status:** `ready` | `needs-info` | `in-progress` | `done`
**Priority:** `P1` critical path / blocks others · `P2` needed before demo · `P3` nice-to-have / parallel

---

## Overview

| ID | Title | Status | Priority | Depends on |
|---|---|:---:|:---:|---|
| INFRA-01 | Bootstrap Next.js frontend | `done` | **P1** | — |
| INFRA-02 | Bootstrap FastAPI backend | `done` | **P1** | — |
| INFRA-03 | MCP server — core implementation | `done` | **P1** | — |
| INFRA-04 | Ollama integration + setup docs | `done` | **P1** | INFRA-03 |
| INFRA-05 | Podman Compose — full stack smoke test | `done` | **P2** | INFRA-01, INFRA-02, INFRA-03 |
| INFRA-06 | CI pipeline | `done` | **P3** | INFRA-01, INFRA-02, INFRA-03 |
| LAB-01 | JupyterLite feasibility spike | `done` | **P1** | — |
| LAB-02 | JupyterLite embed in Next.js `/lab` | `done` | **P1** | LAB-01, INFRA-01 |
| LAB-03 | Notebook 1 — Quantum Fundamentals | `done` | **P1** | LAB-01, LAB-02 |
| LAB-04 | Notebook 2 — First Circuit with IBM Bob | `needs-info` | **P2** | LAB-03, INFRA-03 |
| LAB-05 | Notebook 3 — Simulator vs Real QPU | `needs-info` | **P2** | LAB-03, INFRA-02 |
| DEMO-01 | Demo route scaffold (`/demo`) | `done` | **P1** | INFRA-01 |
| DEMO-02 | Slide content — Quantum Fundamentals deck | `needs-info` | **P2** | DEMO-01, ANIM-01, ANIM-02, ANIM-03 |
| ANIM-01 | Qubit / Bloch sphere animation (CSS/JS) | `needs-validation` | **P1** | — |
| ANIM-02 | Superposition animation (CSS/JS) | `needs-validation` | **P2** | ANIM-01 |
| ANIM-03 | Entanglement / Bell state animation (CSS/JS) | `needs-validation` | **P2** | ANIM-01 |
| DOCS-01 | Documentation route in Next.js | `done` | **P2** | INFRA-01 |
| DOCS-02 | IBM Bob setup guide (pt-BR + Ollama) | `done` | **P2** | INFRA-04 |
| DOCS-03 | Workshop landing page (`/`) | `done` | **P2** | INFRA-01 |
| SETUP-01 | Ollama service in Compose stack | `done` | **P1** | INFRA-04, INFRA-05 |
| SETUP-02 | Prerequisites check script | `done` | **P2** | — |

---

## INFRA — Project Setup

### INFRA-01 · Bootstrap Next.js frontend
**Status:** `ready` · **Priority:** `P1` · **Depends on:** —
**Scope:** `frontend/`
- Init Next.js 14 App Router with TypeScript strict
- Install `@carbon/react`, `@carbon/icons-react`, `next-intl`
- Configure `Theme` provider (`g100` dark) at root layout
- Configure `next-intl` with `en` and `pt-BR` locale files in `frontend/messages/`
- Set up vitest + `@testing-library/react`
- Scaffold routes: `/` `/lab` `/docs/[locale]/[slug]` `/demo`
- **AC:** `pnpm dev` serves the app; `pnpm build` passes; `pnpm lint` clean

---

### INFRA-02 · Bootstrap FastAPI backend
**Status:** `ready` · **Priority:** `P1` · **Depends on:** —
**Scope:** `backend/`
- `uv sync` installs all deps from existing `pyproject.toml`
- Add `/health` route (already stubbed in `main.py`)
- Add router skeletons: `routers/circuit.py` `routers/backends.py`
- `POST /api/circuit/run` accepts `{ code: str, backend: str }` → returns `{ job_id, status }`
- `GET /api/circuit/result/{job_id}` → returns `{ counts, statevector }`
- `GET /api/backends` → computes the list locally (`aer_simulator` + IBM Quantum when `IBMQ_API_TOKEN` set)
- **AC:** `uv run uvicorn main:app --reload` serves; `/health` returns `{"status":"ok"}`; OpenAPI docs at `/docs`

---

### INFRA-03 · MCP server — core implementation
**Status:** `ready` · **Priority:** `P1` · **Depends on:** —
**Scope:** `mcp-server/`
- Scope: the MCP server ONLY wraps the local Qiskit Code Assistant (circuit execution/backends live in the FastAPI backend)
- Tool: `explain_circuit(code: str) → str` — POST to Ollama `http://localhost:11434/v1/chat/completions` with granite model
- Dual transport: stdio default, `--http` flag starts FastAPI/SSE on port 8765
- **AC:** Bob can connect in stdio mode; `uv run server.py --http` starts without error; `explain_circuit` callable

---

### INFRA-04 · Ollama integration + setup docs
**Status:** `ready` · **Priority:** `P1` · **Depends on:** INFRA-03
**Scope:** `mcp-server/` + `scripts/` + `docs/`
- Confirm exact Granite model tag from Qiskit Code Assistant docs (`ibm-granite/granite-3.1-8b-instruct` is a placeholder)
- Document exact `ollama pull <model-tag>` command in setup guides
- Add Ollama availability check to `scripts/setup.sh` and `scripts/setup.ps1` — warn if not installed
- Add Ollama service to `docker-compose.yml` (using `ollama/ollama` image) so container path works without local install
- **AC:** After `podman compose up`, MCP `explain_circuit` tool reaches Ollama; participants don't need Ollama installed locally when using the container path

---

### INFRA-05 · Podman Compose — full stack smoke test
**Status:** `done` · **Priority:** `P2` · **Depends on:** INFRA-01, INFRA-02, INFRA-03
**Scope:** `docker/`
- Write `docker/frontend.Dockerfile` (Node 20, pnpm build, serve with Next.js standalone)
- Write `docker/backend.Dockerfile` (Python 3.11, uv, uvicorn)
- Write `docker/mcp.Dockerfile` (Python 3.11, uv, `--http` entrypoint)
- `podman compose up --build` brings all services up
- **AC:** All three services healthy; `/health` reachable; frontend loads at `:3000`

---

### INFRA-06 · CI pipeline (GitHub Actions)
**Status:** `ready` · **Priority:** `P3` · **Depends on:** INFRA-01, INFRA-02, INFRA-03
**Scope:** `.github/workflows/`
- `ci.yml`: on push/PR → lint + test frontend (`pnpm lint && pnpm test`), lint Python (`ruff check`)
- `build.yml`: on tag → build + push `ghcr.io/YOUR_ORG/bob4q-mcp:latest`
- **AC:** CI green on main; container image published on release tag

---

## LAB — Local Notebooks + `/lab` presentation

> **Pivot (2026-07-30):** dropped embedded JupyterLite (70M Pyodide bundle, COOP/COEP,
> build step). Notebooks now run locally in Jupyter; `/lab` presents them read-only.
> LAB-01 (feasibility spike) and LAB-02 (embed) are superseded by LAB-02b below.

### LAB-01 · JupyterLite feasibility spike — SUPERSEDED
**Status:** `done (superseded)` · **Priority:** `P1` · **Depends on:** —
- Spike showed Pyodide can run Qiskit (StatevectorSampler; no Aer-wasm), but the
  bundle/COOP-COEP/build machinery wasn't worth it for a workshop → pivoted to local.

---

### LAB-02 · JupyterLite embed in Next.js `/lab` — SUPERSEDED by LAB-02b
**Status:** `done (superseded)` · **Priority:** `P1` · **Depends on:** LAB-01, INFRA-01

### LAB-02b · Read-only notebook presentation in `/lab`
**Status:** `done` · **Priority:** `P1` · **Depends on:** INFRA-01, LAB-03
**Scope:** `frontend/src/lib/notebooks.ts`, `frontend/src/app/[locale]/lab/**`
- `NOTEBOOKS` registry + loader reads `../notebooks/*.ipynb`
- `/lab` lists notebooks (title, description, repo path); `/lab/[slug]` renders
  markdown cells (KaTeX-aware) + code cells as `<pre>`, with a "Run locally" panel
- **AC:** `/lab` lists the notebook; `/lab/01-quantum-fundamentals` renders all cells
  and shows the `uv run … jupyter lab` command; math renders via KaTeX

---

### LAB-03 · Notebook 1 — Quantum Fundamentals
**Status:** `done` · **Priority:** `P1` · **Depends on:** LAB-01, LAB-02
**Scope:** `notebooks/`
- File: `notebooks/01-quantum-fundamentals.ipynb`
- Helper lib: `notebooks/lib/visuals.py` (circuit draw helpers, result bar chart)
- Structure: explanation cell → animation reference → code cell → output
- Content: qubit, superposition (H gate), measurement, entanglement (Bell state)
- Both `en` and `pt-BR` Markdown doc counterpart in `docs/i18n/`
- **AC:** Notebook runs top-to-bottom without error; all cells have prose explanations; imports from `notebooks/lib/`

---

### LAB-04 · Notebook 2 — First Circuit with IBM Bob
**Status:** `needs-info` · **Priority:** `P2` · **Depends on:** LAB-03, INFRA-03
**Scope:** `notebooks/`
- File: `notebooks/02-first-circuit-with-bob.ipynb`
- Demonstrates using Bob (via MCP) to explain and iterate on a circuit
- Includes annotated screenshots showing Bob MCP interaction
- **AC:** Notebook documents the Bob workflow; `explain_circuit` MCP tool is exercised

---

### LAB-05 · Notebook 3 — Simulator vs Real QPU
**Status:** `needs-info` · **Priority:** `P2` · **Depends on:** LAB-03, INFRA-02
**Scope:** `notebooks/` + `frontend/`
- File: `notebooks/03-simulator-vs-qpu.ipynb`
- In-notebook: run on Aer simulator, show results
- "Run on QPU" UI button outside notebook → FastAPI → IBM Quantum (requires `IBMQ_API_TOKEN`)
- Graceful degradation when no token is set (show simulated results with a note)
- **AC:** Simulator path works without any token; QPU path calls backend if token present

---

## DEMO — Presenter Slideshow

### DEMO-01 · Demo route scaffold (`/demo`)
**Status:** `ready` · **Priority:** `P1` · **Depends on:** INFRA-01
**Scope:** `frontend/src/app/demo/`
- Full-screen Carbon `g100` layout, zero navigation chrome
- URL-driven slide state: `/demo?slide=N` (N is 1-indexed)
- Keyboard navigation: `ArrowRight` / `ArrowLeft`; `F` for native fullscreen API
- `slides` config array: `{ title, body, animation?: AnimationName, component?: ReactNode }`
- **AC:** Navigating with arrow keys changes slide; URL updates; direct link to slide N works; fullscreen toggle works

---

### DEMO-02 · Slide content — Quantum Fundamentals deck
**Status:** `needs-info` · **Priority:** `P2` · **Depends on:** DEMO-01, ANIM-01, ANIM-02, ANIM-03
**Scope:** `frontend/src/app/[locale]/demo/page.tsx`
- Slide 1: Title / agenda
- Slide 2: What is a qubit? (`qubit` animation component)
- Slide 3: Superposition (`superposition` animation component)
- Slide 4: Entanglement (`entanglement` animation component)
- Slide 5: IBM Bob + Qiskit workflow diagram
- Slide 6: Live demo handoff → open `/lab`
- **AC:** Full deck navigable; animations render inline; no Carbon token violations

---

## ANIM — CSS/JS Animations

> Animations are **CSS/JS React components**, not rendered Manim video. The
> `manim/scenes/*.py` files are the visual reference spec. **Validate each
> animation's concept with the user before implementing it.** Register each
> component in `frontend/src/lib/animations.ts` (keyed by `AnimationName`).
> (Supersedes the former MANIM-01..04 render tasks; `scripts/render-all.*` and
> `frontend/public/videos/` removed.)

### ANIM-01 · Qubit / Bloch sphere animation
**Status:** `needs-validation` · **Priority:** `P1` · **Depends on:** —
**Scope:** `frontend/src/components/animations/` · reference: `manim/scenes/qubit.py`
- Reproduce `QubitScene` as CSS/JS: Bloch sphere showing `|0⟩ → superposition → |1⟩`
- Register under `qubit` in `animations.ts`
- **AC:** concept approved by user; renders in the `/demo` qubit slide; respects `prefers-reduced-motion`

---

### ANIM-02 · Superposition animation
**Status:** `needs-validation` · **Priority:** `P2` · **Depends on:** ANIM-01
**Scope:** `frontend/src/components/animations/` · reference: `manim/scenes/superposition.py`
- Coin analogy → probability amplitude → H gate on the Bloch sphere
- **AC:** concept approved; registered under `superposition` in `animations.ts`

---

### ANIM-03 · Entanglement / Bell state animation
**Status:** `needs-validation` · **Priority:** `P2` · **Depends on:** ANIM-01
**Scope:** `frontend/src/components/animations/` · reference: `manim/scenes/entanglement.py`
- Two qubits, CNOT gate, Bell state measurement correlation
- **AC:** concept approved; registered under `entanglement` in `animations.ts`

---

## DOCS — Workshop Documentation

### DOCS-01 · Documentation route in Next.js
**Status:** `ready` · **Priority:** `P2` · **Depends on:** INFRA-01
**Scope:** `frontend/src/app/docs/`
- Dynamic route `/docs/[locale]/[slug]` reads `docs/i18n/{locale}/{slug}.md`
- Render Markdown with `remark` / `next-mdx-remote`; support LaTeX via `rehype-katex`
- Locale switcher component (Carbon `ContentSwitcher` or `Tabs`)
- **AC:** `docs/i18n/en/01-quantum-fundamentals.md` renders at `/docs/en/01-quantum-fundamentals`; LaTeX formulae render; locale tab switches to `pt-BR`

---

### DOCS-02 · IBM Bob setup guide (pt-BR + Ollama)
**Status:** `ready` · **Priority:** `P2` · **Depends on:** INFRA-04
**Scope:** `docs/i18n/en/bob-setup.md` + `docs/i18n/pt-BR/bob-setup.md`
- English guide already exists; create pt-BR translation
- Add Ollama install instructions (macOS: `brew install ollama`, Windows: installer link, Linux: `curl`)
- Add `ollama pull <model-tag>` step once model tag is confirmed (INFRA-04)
- **AC:** Both locale versions exist; Ollama + Bob + MCP steps are accurate and tested

---

### DOCS-03 · Workshop landing page (`/`)
**Status:** `ready` · **Priority:** `P2` · **Depends on:** INFRA-01
**Scope:** `frontend/src/app/page.tsx`
- Carbon `g100` hero section: title, tagline, "Start Lab" + "View Slides" CTAs
- Module overview section (3 cards, Carbon `Tile`)
- Prerequisites checklist section (Node/Python/Ollama/Podman)
- **AC:** Page matches Carbon DS; no custom hex values; both locale strings present

---

## SETUP — Workshop Onboarding

### SETUP-01 · Ollama service in Compose stack
**Status:** `ready` · **Priority:** `P1` · **Depends on:** INFRA-04, INFRA-05
**Scope:** `docker-compose.yml` + `docker/`
- Add `ollama` service using `ollama/ollama` image
- Model auto-pull on start via entrypoint script
- MCP server `OLLAMA_HOST` env var points to `http://ollama:11434`
- **AC:** `podman compose up` pulls model on first start; `explain_circuit` tool works without local Ollama install

---

### SETUP-02 · Prerequisites check script
**Status:** `ready` · **Priority:** `P2` · **Depends on:** —
**Scope:** `scripts/check-prereqs.sh` + `scripts/check-prereqs.ps1`
- Check: Node ≥20, pnpm ≥9, Python ≥3.11, uv, Ollama (if local mode), Podman or Docker
- Print clear ✓/✗ per requirement with install link on failure
- Call this at the top of `setup.sh` / `setup.ps1`
- **AC:** Script exits 0 when all prereqs met; exits 1 with actionable messages when any missing

---

## FUTURE (not scoped for initial workshop)

| ID | Title | Depends on |
|---|---|---|
| LAB-06 | Notebook 4 — Results visualization (histogram, statevector plot) | LAB-05 |
| LAB-07 | Notebook 5 — Variational algorithms (VQE/QAOA) with Bob assistance | LAB-06 |
| INFRA-07 | Async recording / video export of the workshop run | INFRA-05 |
| INFRA-08 | Multi-tenant workshop VM provisioning (Ansible / Terraform) | INFRA-05 |
| i18n-03 | Add third locale (e.g., `es` or `ja`) | DOCS-01 |

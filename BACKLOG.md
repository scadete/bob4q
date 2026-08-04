# BACKLOG.md

Items are **ready** when all unknowns are resolved and acceptance criteria are clear.

**Status:** `ready` | `needs-info` | `in-progress` | `done` | `removed`
**Priority:** `P1` critical path / blocks others · `P2` needed before demo · `P3` nice-to-have / parallel

---

## Overview

| ID | Title | Status | Priority | Depends on |
|---|---|:---:|:---:|---|
| INFRA-01 | Bootstrap Next.js frontend | `done` | **P1** | — |
| INFRA-02 | Bootstrap FastAPI backend — REMOVED | `removed` | **P1** | — |
| INFRA-03 | MCP server — core implementation | `done` | **P1** | — |
| INFRA-04 | Ollama integration + setup docs | `done` | **P1** | INFRA-03 |
| INFRA-05 | Podman Compose — full stack smoke test | `done` | **P2** | INFRA-01, INFRA-03 |
| INFRA-06 | CI pipeline | `done` | **P3** | INFRA-01, INFRA-03 |
| LAB-01 | JupyterLite feasibility spike | `done` | **P1** | — |
| LAB-02 | JupyterLite embed in Next.js `/lab` | `done` | **P1** | LAB-01, INFRA-01 |
| LAB-03 | Notebook 1 — Quantum Fundamentals | `done` | **P1** | LAB-01, LAB-02 |
| LAB-04 | Notebook 2 — First Circuit with IBM Bob | `done` | **P2** | LAB-03, INFRA-03 |
| LAB-05 | Notebook 3 — Simulator vs Real QPU | `done` | **P2** | LAB-03 |
| DEMO-01 | Demo route scaffold (`/demo`) | `done` | **P1** | INFRA-01 |
| DEMO-02 | Slide content — full 16-slide workshop deck | `done` | **P2** | DEMO-01, ANIM-01..07 |
| ANIM-01 | Qubit / Bloch sphere animation (CSS/JS) | `done` | **P1** | — |
| ANIM-02 | Superposition animation (CSS/JS) | `done` | **P2** | ANIM-01 |
| ANIM-03 | Entanglement / Bell state animation (CSS/JS) | `done` | **P2** | ANIM-01 |
| ANIM-04 | Agentic loop animation (You ↔ Bob ↔ MCP) | `done` | **P2** | — |
| ANIM-05 | Results histogram animation | `done` | **P2** | — |
| ANIM-06 | Parity: classical vs quantum animation | `done` | **P2** | — |
| ANIM-07 | Grover amplitude amplification animation | `done` | **P2** | — |
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

### INFRA-02 · Bootstrap FastAPI backend — REMOVED
**Status:** `removed` · **Priority:** `P1` · **Depends on:** —
**Scope:** ~~`backend/`~~
- The FastAPI backend was built, then removed once we confirmed nothing depended on it as a
  live server: the frontend never called it (only referenced it in demo narration text), and
  the only real caller was the notebooks, run locally by each participant.
- Its circuit-execution and backend-listing logic (`run_via_backend`, `list_backends`) was
  ported to `notebooks/lib/backend.py` and now runs in-process inside each notebook's own
  kernel — no server, no port, no separate `uv` env to keep in sync.
- `backend/`, `docker/backend.Dockerfile`, the compose `backend` service, and the CI `backend`
  job were all deleted accordingly.
- **Why this is fine:** the old `/api/circuit/run` handler always ran on `AerSimulator()`
  regardless of the requested `backend` — the real-QPU routing was never actually implemented.
  The in-process port in `notebooks/lib/backend.py` fixes that (routes to
  `QiskitRuntimeService`/`SamplerV2` for non-simulator backend names).

---

### INFRA-03 · MCP server — core implementation
**Status:** `ready` · **Priority:** `P1` · **Depends on:** —
**Scope:** `mcp-server/`
- Scope: the MCP server ONLY wraps the local Qiskit Code Assistant (circuit execution/backends
  live in `notebooks/lib/backend.py`, run in-process by each notebook — see INFRA-02)
- Tool: `explain_circuit(code: str) → str` — POST to Ollama `http://localhost:11434/v1/chat/completions` with granite model
- Dual transport: stdio default, `--http` flag starts FastAPI/SSE on port 8765
- **Multi-MCP orchestration, resolved:** the capstone's "Bob composes the Qiskit Code Assistant
  MCP with other MCP tools" is this same dual transport — there is one tool (`explain_circuit`),
  reachable either as a **local** subprocess (stdio, `uv run server.py`) or a **remote/shared**
  instance (`uv run server.py --http`, e.g. one server for a whole workshop room). Bob's MCP
  config (`~/.bob/mcp-servers.json`) points at whichever is appropriate; the `/demo` deck and
  notebooks 02–05 have been worded accordingly (no separate "other" tools exist or are planned)
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
**Status:** `done` · **Priority:** `P2` · **Depends on:** INFRA-01, INFRA-03
**Scope:** `docker/`
- Write `docker/frontend.Dockerfile` (Node 20, pnpm build, serve with Next.js standalone)
- Write `docker/mcp.Dockerfile` (Python 3.11, uv, `--http` entrypoint)
- `podman compose up --build` brings all services up
- **AC:** Both services healthy; frontend loads at `:3000`

---

### INFRA-06 · CI pipeline (GitHub Actions)
**Status:** `ready` · **Priority:** `P3` · **Depends on:** INFRA-01, INFRA-03
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
**Status:** `done` · **Priority:** `P2` · **Depends on:** LAB-03, INFRA-03
**Scope:** `notebooks/`
- File: `notebooks/02-first-circuit-with-bob.ipynb`
- Demonstrates using Bob (via MCP) to explain and iterate on a circuit
- Helper lib: `notebooks/lib/backend.py` (`run_via_backend`, `explain_with_bob`, graceful degradation)
- Both `en` and `pt-BR` Markdown doc counterpart in `docs/i18n/`
- **AC:** Notebook documents the Bob workflow; `explain_circuit` MCP tool is exercised (degrades
  gracefully if the MCP server isn't running); `run_via_backend()` produces the Bell 00/11 histogram

---

### LAB-05 · Notebook 3 — Simulator vs Real QPU
**Status:** `done` · **Priority:** `P2` · **Depends on:** LAB-03
**Scope:** `notebooks/`
- File: `notebooks/03-simulator-vs-qpu.ipynb`
- In-notebook: run on Aer simulator, show results
- Real-QPU path runs in-process via `run_via_backend(code, backend=<ibm_backend_name>)`
  (`notebooks/lib/backend.py`), routing through `QiskitRuntimeService`/`SamplerV2` — requires
  an `IBMQ_API_TOKEN` environment variable set before launching Jupyter. No separate frontend
  UI button — this was planned when the FastAPI backend existed (see INFRA-02), but the
  notebook-only path covers the same demo need without a server.
- Graceful degradation when no token is set (show simulated results with a note)
- Both `en` and `pt-BR` Markdown doc counterpart in `docs/i18n/`
- **AC:** Simulator path works without any token; QPU path runs locally if `IBMQ_API_TOKEN` is set

---

### LAB-06 · Notebook 4 — Quantum Advantage & Oracles
**Status:** `done` · **Priority:** `P2` · **Depends on:** LAB-03
**Scope:** `notebooks/`
- File: `notebooks/04-quantum-advantage-oracles.ipynb`
- Loop: classical parity check (query the hidden function bit-by-bit) vs quantum parity check
  (superpose the input, query the oracle once, interfere) — same answer, one query instead of many
- Build the 1-query oracle circuit in Qiskit and run it, observing the single-query result
- Maps to deck S11–S12; reuses `ParityAnimation` as the visual reference
- Implemented as the Bernstein–Vazirani algorithm (n classical queries vs 1 quantum query)
- Both `en` and `pt-BR` Markdown doc counterpart in `docs/i18n/`
- **AC:** Notebook runs top-to-bottom without error; classical and quantum paths both produce the
  same parity bit; query counts are shown explicitly for each side

---

### LAB-07 · Notebook 5 — Grover SAT Capstone (built by Bob)
**Status:** `done` · **Priority:** `P1` · **Depends on:** LAB-06, INFRA-03
**Scope:** `notebooks/`
- File: `notebooks/05-grover-sat-capstone.ipynb`
- Pick a small boolean formula; ask Bob — reaching the Qiskit Code Assistant MCP, whether it's
  running locally or on a shared remote server — to author the `PhaseOracle` marking its
  satisfying assignment
- Run Grover via `run_via_backend()` on the Aer simulator; read the amplified histogram
- Cross-check the result against a classical brute-force search over the formula
- Maps to deck S14–S15; reuses `AmplitudeAmplificationAnimation` as the visual reference
- Forward-looking teaser at the end: QAOA/QUBO ("Bob builds the QUBO") as the next optimization step
- Both `en` and `pt-BR` Markdown doc counterpart in `docs/i18n/`
- **AC:** Notebook runs top-to-bottom without error; histogram is peaked on the satisfying
  assignment(s); brute-force cross-check passes; teaser note links to the future QAOA/VQE item

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

### DEMO-02 · Slide content — full 16-slide workshop deck
**Status:** `done` · **Priority:** `P2` · **Depends on:** DEMO-01, ANIM-01..07
**Scope:** `frontend/src/app/[locale]/demo/page.tsx`
- S1 Title · S2 Today's arc · S3 Meet IBM Bob (`agenticLoop`) · S4 Qubit (`qubit`) ·
  S5 Superposition (`superposition`) · S6 Measurement & statistics (`resultsHistogram`) ·
  S7 Entanglement (`entanglement`) · S8 Gates & circuits (`gates`) · S9 Ask Bob to build it ·
  S10 Run & read it (`resultsHistogram`) · S11 Classical parity check (`parity`) ·
  S12 Quantum parity check (`parity`) · S13 Simulator vs real QPU · S14 The oracle & search
  (`amplitudeAmplification`) · S15 Build a SAT oracle with Bob · S16 Live demo handoff → `/lab`
- Text-only slides (S2, S9, S13, S15) are presenter-narrated / live-demo beats, no canvas animation
- **AC met:** full deck navigable; animations render inline; no Carbon token violations
- **Still open:** deck text is English-only (i18n migration is a bonus, not a blocker, per plan);
  S9/S15 live-demo beats aren't yet backed by the notebooks in LAB-04/06/07 below

---

## ANIM — CSS/JS Animations

> Animations are **CSS/JS React components**, not rendered Manim video. The
> `manim/scenes/*.py` files are the visual reference spec. **Validate each
> animation's concept with the user before implementing it.** Register each
> component in `frontend/src/lib/animations.ts` (keyed by `AnimationName`).
> (Supersedes the former MANIM-01..04 render tasks; `scripts/render-all.*` and
> `frontend/public/videos/` removed.)

### ANIM-01 · Qubit / Bloch sphere animation
**Status:** `done` · **Priority:** `P1` · **Depends on:** —
**Scope:** `frontend/src/components/animations/{bloch.ts,QubitAnimation.tsx}`
- Canvas 3D projection (shared `bloch.ts`): gates as Bloch rotations, H → Z → H (H·Z·H = X), with a live P(0)/P(1) readout
- Registered under `qubit` in `animations.ts`
- **AC met:** approved; renders in the `/demo` qubit slide; reduced-motion still-frame

---

### ANIM-02 · Superposition animation
**Status:** `done` · **Priority:** `P2` · **Depends on:** ANIM-01
**Scope:** `frontend/src/components/animations/SuperpositionAnimation.tsx`
- H|0⟩ → |+⟩ (animated), then instantaneous measurement collapse; running histogram converges to ~50/50
- **AC met:** registered under `superposition`; renders in `/demo`

---

### ANIM-03 · Entanglement / Bell state animation
**Status:** `done` · **Priority:** `P2` · **Depends on:** ANIM-01
**Scope:** `frontend/src/components/animations/EntanglementAnimation.tsx`
- Two nodes A/B: H then CNOT (bond forms) → Bell state; correlated measurement → 4-bar histogram where only 00/11 fill
- Not a Bloch sphere (entangled qubit is maximally mixed) — shows the correlation instead
- **AC met:** registered under `entanglement`; renders in `/demo`

---

### ANIM-04 · Agentic loop animation
**Status:** `done` · **Priority:** `P2` · **Depends on:** —
**Scope:** `frontend/src/components/animations/AgenticLoopAnimation.tsx`
- Three nodes (You, Bob, MCP) with a pulse traveling prompt → tool call → result → explanation
- MCP node tagged "local or remote" — same Qiskit Code Assistant tool either way (see the
  "Multi-MCP orchestration" resolution under INFRA-03)
- **AC met:** registered under `agenticLoop`; renders on S3

---

### ANIM-05 · Results histogram animation
**Status:** `done` · **Priority:** `P2` · **Depends on:** —
**Scope:** `frontend/src/components/animations/ResultsHistogramAnimation.tsx`
- Measurement-and-tally visual lifted out of `SuperpositionAnimation.tsx` (no Bloch sphere) so it's
  reusable standalone; many shots → convergent histogram
- **AC met:** registered under `resultsHistogram`; reused on both S6 and S10

---

### ANIM-06 · Parity: classical vs quantum animation
**Status:** `done` · **Priority:** `P2` · **Depends on:** —
**Scope:** `frontend/src/components/animations/ParityAnimation.tsx`
- Split-screen: classical side steps through 4 sequential queries; quantum side superposes,
  queries the oracle once, interferes — same revealed parity bit, different query count
- **AC met:** registered under `parity`; reused on both S11 (classical) and S12 (quantum), presenter
  narrates the matching side

---

### ANIM-07 · Grover amplitude amplification animation
**Status:** `done` · **Priority:** `P2` · **Depends on:** —
**Scope:** `frontend/src/components/animations/AmplitudeAmplificationAnimation.tsx`
- 8-state amplitude bar chart computed from real Grover math (oracle phase-flip + diffusion mean
  reflection, not a canned illustration); ~π/4·√8 ≈ 2 iterations peak the marked bar
- **AC met:** registered under `amplitudeAmplification`; renders on S14

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
| LAB-08 | Notebook 6 — Variational algorithms (VQE/QAOA) with Bob assistance | LAB-07 |
| INFRA-07 | Async recording / video export of the workshop run | INFRA-05 |
| INFRA-08 | Multi-tenant workshop VM provisioning (Ansible / Terraform) | INFRA-05 |
| i18n-03 | Add third locale (e.g., `es` or `ja`) | DOCS-01 |

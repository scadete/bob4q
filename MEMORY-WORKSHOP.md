# MEMORY-WORKSHOP.md
> Workshop content and UX domain memory.

## Audience
- Beginner→intermediate quantum devs
- Mix of IBM employees and external attendees
- Fresh laptops or workshop-provided VMs

## Format
- **Half-day (3–4 h)** — lean, live demo-driven
- Facilitator presents on projector via `/demo` slideshow; participants follow along in JupyterLite

## Setup Requirements (per participant)
- Podman (preferred) OR Python 3.11+ + Node 20+ + pnpm + Ollama
- 8GB+ RAM (Ollama + Granite model)
- `scripts/setup.sh` (POSIX) or `scripts/setup.ps1` (Windows)
- `scripts/setup-docker.sh` (POSIX) or `scripts/setup-container.ps1` (Windows) for container path

## Workshop Modules (half-day scope — 2–3 modules)
1. **Quantum Fundamentals** — qubits, superposition, entanglement (CSS/JS animations + slides)
2. **First Circuit with IBM Bob** — Qiskit run locally in Jupyter, Bob assistance via MCP
3. **Simulator vs Real QPU** — run in Aer locally in Jupyter, escalate to real IBM Quantum via `run_via_backend()` in-process (no server/button)

> Modules 4–5 (results visualization, variational algorithms) are backlogged for future workshops.

## Lab: JupyterLite
- Embedded in Next.js frontend as `<iframe>` at `/lab`
- WASM/Pyodide runtime — zero-install for participants
- **Aer-wasm is NOT available in Pyodide** — use `qiskit.primitives.StatevectorSampler` for in-browser simulation
- Notebooks in `notebooks/` — shared helper code in `notebooks/lib/` (imported in cells to keep noise low)
- Real QPU: `run_via_backend()` in `notebooks/lib/backend.py` calls IBM Quantum directly, in-process — no server (FastAPI backend removed 2026-08-04, see BACKLOG INFRA-02)

## LAB-01 — JupyterLite Feasibility Spike Findings

### Build pipeline
- `scripts/build-jupyterlite.sh` uses `uv run --with jupyterlite-core --with jupyterlite-pyodide-kernel jupyter lite build`
- No global pip install required — `uv` fetches packages on demand
- `--lite-dir` and `--output-dir` **must** point to different directories; script fixed accordingly
- Built output lands in `.jupyterlite_build/`, then `cp`-ed to `frontend/public/jupyterlite/`
- Config: `notebooks/jupyter_lite_config.json` (enables Lab app, Pyodide kernel)
- Windows equivalent: `scripts/build-jupyterlite.ps1` (same fix applied)

### Package availability in Pyodide
| Package | Pyodide availability | Install method | Notes |
|---|:---:|---|---|
| `qiskit==1.2.0` | ✅ | `micropip.install` | Confirmed on PyPI with pure-Python wheel |
| `matplotlib` | ✅ | `micropip.install` | Pyodide ships a pre-compiled version |
| `pylatexenc` | ✅ | `micropip.install` | **Required** for `qc.draw(output="mpl")` — added to notebook install cell |
| `qiskit-aer` | ❌ | n/a | C-extension; no WASM build available |
| `qiskit-aer-wasm` | ❌ | n/a | Package does not exist on PyPI (as of 2024) |

### Design decision: Aer simulator
`qiskit-aer` cannot run in Pyodide (C-extension, no WASM wheel).
**Chosen path:** `qiskit.primitives.StatevectorSampler` — pure Python, ships with `qiskit` core,
produces identical measurement counts for the circuits in the workshop.
The notebook already documents this limitation for participants.
Full Aer / real QPU → `run_via_backend()`, in-process, no FastAPI backend (removed).

### COOP/COEP headers
`next.config.ts` already sets `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` on all routes, plus
`Cross-Origin-Resource-Policy: cross-origin` on `/jupyterlite/*` assets — required for
`SharedArrayBuffer` (Pyodide's WASM threading). No further changes needed.

### Acceptance criteria — status
- [x] Build script produces a static JupyterLite site
- [x] Notebook opens automatically via `?path=` query param in `LabEmbed.tsx`
- [x] `from qiskit import QuantumCircuit; qc = QuantumCircuit(2); qc.h(0); qc.cx(0,1); print(qc.draw())` — runs via StatevectorSampler path
- [x] `matplotlib` + `pylatexenc` available → `qc.draw(output="mpl")` works
- [x] Findings documented here → LAB-02 unblocked

## Demo Route
- `/demo` = full-screen Carbon slideshow for facilitator
- Renders CSS/JS animations at key concept moments
- Facilitator navigates with keyboard; participants watch on projector

## Documentation i18n
- Docs source: `docs/i18n/{locale}/{module}.md`
- Supported locales: `en`, `pt-BR`
- All new doc content must have both locales at minimum
- Rendered as web pages under `/docs/[locale]/[slug]`

## Content Principles
- Explanatory first — every code sample has a prose explanation
- Animation (CSS/JS) precedes code introduction (visual → concrete)
- IBM Bob interactions shown as annotated screenshots or live demo
- No jargon without definition

## Open Questions
- [x] Qiskit Aer-wasm availability in Pyodide — **resolved** (LAB-01): Aer not available; use StatevectorSampler
- [ ] VM provisioning strategy for large groups (TBD)
- [ ] Recording/async version of workshop content (future)

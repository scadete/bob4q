# MEMORY.md
> Simplified annotation format. Update on every significant decision.

## Project
- Name: bob4q
- Goal: quantum dev workshop lab — IBM Bob + Qiskit MCP → full-stack demo
- Audience: workshop participants (beginner→intermediate quantum devs)
- Constraint: must work on fresh machines + containers — macOS, Windows, Linux

## Key Decisions
- [STACK] Next.js 14 App Router + Carbon Design System → workshop-friendly, IBM-native UI
- [STACK] FastAPI → Python-native, matches Qiskit ecosystem
- [STACK] pnpm workspaces → single `pnpm install` at root for all JS
- [STACK] uv per Python pkg → fast installs, reproducible envs
- [MCP] Custom Python MCP server wraps Qiskit + Qiskit Code Assistant
- [MCP] Dual transport: stdio (local Bob) + HTTP SSE (remote/container demo)
- [MCP] Ollama for local model serving (Qiskit Code Assistant / granite) — participants run `ollama pull` pre-workshop
- [MATH] Animations are CSS/JS React components (pivot 2026-07-30); no Manim render/video pipeline. `manim/scenes/*.py` kept as reference spec. Validate each animation concept with the user before building it. Registry: `frontend/src/lib/animations.ts`
- [i18n] Two i18n systems: next-intl (UI) + Markdown folders (workshop docs)
- [DEPLOY] Podman Compose for full stack (Docker Compose compatible — same file); container image published to ghcr.io
- [PLATFORM] Cross-platform: macOS/Windows/Linux — sh scripts for POSIX, .ps1 scripts for Windows
- [SECURITY] No cloud API for Qiskit Code Assistant — local model only
- [WORKSHOP] Format: half-day (3–4 h), lean, 2–3 core modules, live demo-driven
- [LAB] Pivoted away from embedded JupyterLite (2026-07-30): too much machinery (70M Pyodide bundle, COOP/COEP, build step). Notebooks now run locally in Jupyter; `/lab` presents them read-only with repo path + a `uv run … jupyter lab` command. Registry/loader: `frontend/src/lib/notebooks.ts`
- [LAB] Notebooks use helper modules from `notebooks/lib/` to keep cell code minimal
- [LAB] Simulation via `qiskit.primitives.StatevectorSampler` (no Aer); optional real QPU still via FastAPI backend
- [DEMO] `/demo` route = presenter-driven full-screen slideshow (Carbon layout + CSS/JS animations); facilitator controls, participants watch

## Status
- [x] Repo initialized
- [x] Folder scaffolding created
- [x] Frontend bootstrapped (Next.js 14, Carbon g100, next-intl en+pt-BR, vitest)
- [x] MCP server implementation complete (4 tools, stdio + HTTP SSE)
- [x] Backend API implemented (routers/circuit.py, routers/backends.py)
- [x] Manim reference scenes exist (QubitScene + SuperpositionScene + EntanglementScene) — spec for CSS/JS animations, not rendered
- [ ] CSS/JS animation components (qubit, superposition, entanglement) — validate each concept with user before building
- [x] Dockerfiles + Compose stack (frontend/backend/mcp/ollama services)
- [x] Docs/i18n structure created (en + pt-BR, quantum-fundamentals + bob-setup)
- [x] Workshop setup scripts complete (check-prereqs.sh/.ps1); render-all scripts removed with the video pivot
- [x] CI pipeline (ci.yml + build.yml)
- [x] LAB: `/lab` presents notebooks read-only (index + `/lab/[slug]` reader) with "Run locally" panel; JupyterLite removed
- [x] Starter notebook created (notebooks/01-quantum-fundamentals.ipynb)
- [x] notebooks/lib/visuals.py helper library created (draw_circuit, plot_counts, run_and_plot)
- [x] Dockerfile suite fixed (uv pip install, pnpm workspace context, mjs config deduped)
- [ ] First end-to-end demo working

## Gotchas (learned)
- Notebook 01 Bell cell used `result[0].data.meas` — wrong: `QuantumCircuit(2,2)` names its classical register `c`, so DataBin only has `.c`. Fixed to `.data.c`. Verified all cells on qiskit==1.2.0.
- Markdown pipeline bug (both docs and lab): `unified().use(remark)` passes a *processor* as a plugin → `attacher.call is not a function`. Correct form is `remark().use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify)`. Also `katex` must be a *direct* dep for `import "katex/dist/katex.min.css"` to resolve under pnpm.
- Notebooks run locally (real Jupyter), so the install cell uses `%pip install`, not Pyodide's `micropip`.

## Blockers / Open Questions
- ghcr.io org name TBD → placeholder `YOUR_ORG` used
- Notebooks use `qiskit.primitives.StatevectorSampler` (no Aer dependency); optional Aer/real QPU only via FastAPI backend
- Workshop target locales TBD → starting with en, pt-BR

## References
- Carbon DS: https://github.com/carbon-design-system/carbon
- Manim: https://github.com/3b1b/manim
- Qiskit: https://github.com/Qiskit/qiskit
- next-intl: https://next-intl-docs.vercel.app

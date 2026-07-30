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
- [MATH] Manim pre-render pipeline → no runtime Manim dependency on server
- [i18n] Two i18n systems: next-intl (UI) + Markdown folders (workshop docs)
- [DEPLOY] Podman Compose for full stack (Docker Compose compatible — same file); container image published to ghcr.io
- [PLATFORM] Cross-platform: macOS/Windows/Linux — sh scripts for POSIX, .ps1 scripts for Windows
- [SECURITY] No cloud API for Qiskit Code Assistant — local model only
- [WORKSHOP] Format: half-day (3–4 h), lean, 2–3 core modules, live demo-driven
- [LAB] Jupyter notebook-style; JupyterLite embedded in Next.js frontend via iframe (zero-install, WASM/Pyodide)
- [LAB] Notebooks use helper modules from `notebooks/lib/` to keep cell code minimal
- [LAB] Simulator only in JupyterLite (Qiskit Aer-wasm); real QPU via FastAPI backend "Run on QPU" button
- [DEMO] `/demo` route = presenter-driven full-screen slideshow (Carbon layout + Manim animations); facilitator controls, participants watch

## Status
- [x] Repo initialized
- [x] Folder scaffolding created
- [x] Frontend bootstrapped (Next.js 14, Carbon g100, next-intl en+pt-BR, vitest)
- [x] MCP server implementation complete (4 tools, stdio + HTTP SSE)
- [x] Backend API implemented (routers/circuit.py, routers/backends.py)
- [x] First Manim scene created (QubitScene + SuperpositionScene + EntanglementScene)
- [x] Dockerfiles + Compose stack (frontend/backend/mcp/ollama services)
- [x] Docs/i18n structure created (en + pt-BR, quantum-fundamentals + bob-setup)
- [x] Workshop setup scripts complete (check-prereqs.sh/.ps1 + render-all.sh/.ps1)
- [x] CI pipeline (ci.yml + build.yml)
- [x] LAB-01: JupyterLite embedded in frontend (/lab route, LabEmbed component, COOP/COEP headers)
- [x] Starter notebook created (notebooks/01-quantum-fundamentals.ipynb)
- [x] notebooks/lib/visuals.py helper library created (draw_circuit, plot_counts, run_and_plot)
- [x] Dockerfile suite fixed (uv pip install, pnpm workspace context, mjs config deduped)
- [x] JupyterLite static bundle built + committed (frontend/public/jupyterlite/, 70M)
- [ ] First end-to-end demo working

## Gotchas (learned)
- build-jupyterlite scripts needed `--with jupyter-server` — required by `jupyter lite build --contents` to bake in notebooks (else RuntimeError)
- Notebook 01 Bell cell used `result[0].data.meas` — wrong: `QuantumCircuit(2,2)` names its classical register `c`, so DataBin only has `.c`. Fixed to `.data.c`. Verified all cells on qiskit==1.2.0 (StatevectorSampler, no Aer per Pyodide constraint)

## Blockers / Open Questions
- ghcr.io org name TBD → placeholder `YOUR_ORG` used
- Qiskit Aer-wasm (qiskit-aer) NOT available in Pyodide — using `qiskit.primitives.StatevectorSampler` instead; Aer only via FastAPI backend "Run on QPU"
- Workshop target locales TBD → starting with en, pt-BR

## References
- Carbon DS: https://github.com/carbon-design-system/carbon
- Manim: https://github.com/3b1b/manim
- Qiskit: https://github.com/Qiskit/qiskit
- next-intl: https://next-intl-docs.vercel.app

# bob4q — Quantum Experience Lab

> An end-to-end quantum computing workshop demo integrating **IBM Bob** AI assistant with **Qiskit** via MCP servers.

## ✦ What is this?

A full-stack, workshop-ready environment where participants learn quantum computing concepts through:
- **IBM Bob** AI assistance (Qiskit Code Assistant, local model)
- **Interactive circuits** built and executed live
- **Visual explanations** powered by [Manim](https://github.com/3b1b/manim) animations
- **IBM Carbon Design System** UI — dark-themed, presentation-grade
- **i18n docs** (English + pt-BR) ready for global workshops

## ✦ Quick Start

### Option A — Docker (recommended for workshops)
```bash
docker compose up
# frontend → http://localhost:3000
# MCP server → http://localhost:8765 (HTTP SSE)
# backend API → http://localhost:8000
```

### Option B — Local development
```bash
# Prerequisites: Node 20+, pnpm 9+, Python 3.11+, uv

# JS packages
pnpm install

# Start frontend
pnpm dev

# MCP server (separate terminal)
cd mcp-server && uv run server.py

# Backend API (separate terminal)
cd backend && uv run uvicorn main:app --reload
```

## ✦ Project Structure

```
bob4q/
├── frontend/        # Next.js 14 + Carbon Design System
├── backend/         # FastAPI — circuit execution API
├── mcp-server/      # Qiskit MCP server (stdio + HTTP)
├── manim/           # Animation scenes (pre-rendered)
├── docs/            # Workshop documentation (i18n Markdown)
│   └── i18n/
│       ├── en/
│       └── pt-BR/
├── docker/          # Dockerfiles
├── scripts/         # Workshop setup helpers
├── AGENTS.md        # AI assistant guidance
├── MEMORY.md        # Project memory (agents)
└── docker-compose.yml
```

## ✦ IBM Bob Integration

Bob connects to the MCP server via:
- **Local**: Bob spawns `mcp-server/server.py` as stdio subprocess
- **Remote/Workshop**: Bob connects to `http://localhost:8765/sse`

See [`docs/i18n/en/bob-setup.md`](docs/i18n/en/bob-setup.md) for configuration instructions.

## ✦ Workshop Modules

| # | Module | Concepts |
|---|--------|---------|
| 1 | Quantum Fundamentals | Qubits, superposition, entanglement |
| 2 | First Circuit with Bob | Qiskit basics, AI assistance |
| 3 | Simulator vs Real QPU | IBM Quantum backends |
| 4 | Results & Visualization | Measurement, statistics |
| 5 | Variational Algorithms | VQE, QAOA with AI guidance |

## ✦ Tech Stack

| | |
|---|---|
| Frontend | Next.js 14, TypeScript, `@carbon/react` |
| Animations | Manim (Python) — pre-rendered |
| Backend | FastAPI, Python 3.11+ |
| MCP Server | Python MCP, Qiskit, local LLM |
| i18n (UI) | next-intl |
| i18n (Docs) | Markdown per locale |
| Container | Docker Compose |

## ✦ Contributing

See [AGENTS.md](AGENTS.md) for development conventions and commands.

---
<sub>Built with ❤️ for IBM quantum workshops</sub>

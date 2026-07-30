# MEMORY-ARCH.md
> Architecture domain memory.

## System Diagram
```
Workshop Participant
       │
       ▼
  [Browser]
  Next.js frontend (Carbon DS)
       │
  ┌────┴──────────────┐
  │                   │
  ▼                   ▼
[FastAPI backend]  [next-intl]
  /api/circuit       i18n UI
  /api/render
       │
  ┌────┴──────────────┐
  │                   │
  ▼                   ▼
[Qiskit]       [Manim render]
[MCP server]   (pre-render or on-demand)
  stdio/HTTP
       │
  ┌────┴──────────────┐
  │                   │
  ▼                   ▼
[IBM Quantum]  [Qiskit Code Assistant]
 simulator/     local model
 real backend   (llama-cpp/ollama)
```

## Data Flow — Circuit Execution
1. User builds circuit in frontend lab UI
2. POST `/api/circuit/run` → FastAPI backend
3. Backend calls MCP tool `run_circuit` via MCP client
4. MCP server executes via Qiskit (simulator or real backend)
5. Result (counts, statevector) returned as JSON → visualized in frontend

## Data Flow — Animation
1. Content author writes Manim scene in `manim/scenes/`
2. CI or `scripts/render-all.sh` renders to `frontend/public/videos/`
3. Committed to repo (or CDN upload for prod)
4. Frontend `<QuantumAnimation>` serves via `<video>`

## Deployment Modes
| Mode | How | MCP transport |
|---|---|---|
| Local (full) | `docker compose up` | stdio or HTTP |
| Local (dev) | pnpm dev + uv run separately | stdio |
| Workshop VM/Cloud | Docker image pull | HTTP SSE |
| Production demo | Hosted containers | HTTP SSE |

## Constraints
- Qiskit Code Assistant CANNOT be called via cloud — local model only
- Manim MUST be pre-rendered for production (runtime render too slow for demo)
- Carbon DS tokens MUST be used — no custom theming that breaks Carbon's accessibility

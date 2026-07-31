# MEMORY-ARCH.md
> Architecture domain memory.

## System Diagram
```
Workshop Participant
       │
       ▼
  [Browser]
  Next.js frontend (Carbon DS + CSS/JS animations)
       │
  ┌────┴──────────────┐
  │                   │
  ▼                   ▼
[FastAPI backend]  [next-intl]
  /api/circuit       i18n UI
       │
  ┌────┴──────────────┐
  │                   │
  ▼                   ▼
[Qiskit]
[MCP server]
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
1. A `manim/scenes/*.py` file documents what the animation should depict (reference spec)
2. Its concept is validated with the user, then reimplemented as a CSS/JS React component
3. The component is registered in `frontend/src/lib/animations.ts` (keyed by `AnimationName`)
4. `SlideShow` renders it client-side by the slide's `animation` key — no video, no backend

## Deployment Modes
| Mode | OS | How | MCP transport |
|---|---|---|---|
| Local (full) | mac/linux | `podman compose up` | stdio or HTTP |
| Local (full) | windows | `podman compose up` (Podman Desktop) | HTTP |
| Local (dev) | any | pnpm dev + uv run separately | stdio |
| Workshop VM/Cloud | any | Podman/Docker image pull | HTTP SSE |
| Production demo | any | Hosted containers | HTTP SSE |

## Container Strategy
- Compose file is version-field-free (compatible with Podman Compose + Docker Compose)
- Podman preferred: rootless by default, no daemon, better security for workshop VMs
- Docker fallback: identical compose file, scripts auto-detect `podman` vs `docker`
- Windows: use Podman Desktop (WSL2 backend) — scripts in `scripts/*.ps1`

## Constraints
- Qiskit Code Assistant CANNOT be called via cloud — local model only
- Animations are CSS/JS components (no Manim render, no video); `manim/scenes/*.py` is reference-only
- Carbon DS tokens MUST be used — no custom theming that breaks Carbon's accessibility

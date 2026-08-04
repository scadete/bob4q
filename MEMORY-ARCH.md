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
[Jupyter kernel]   [next-intl]
  notebooks/lib/      i18n UI
  backend.py (Qiskit,
  in-process)
       │
       ▼
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

> **2026-08-04:** there is no FastAPI backend. It was built, then removed once we confirmed
> nothing depended on it as a live server. See BACKLOG INFRA-02.

## Data Flow — Circuit Execution
1. User (workshop participant) runs a cell in their own notebook
2. `run_via_backend(code, backend=...)` (`notebooks/lib/backend.py`) execs the circuit code
   in-process, in the notebook's own kernel
3. `aer_simulator` → runs directly via `qiskit_aer.AerSimulator`; any other backend name →
   routes through `qiskit_ibm_runtime.QiskitRuntimeService`/`SamplerV2` to real IBM Quantum
   hardware (requires `IBMQ_API_TOKEN`)
4. Result (counts dict) returned directly to the notebook cell — no HTTP round trip
5. Separately, `explain_with_bob(code)` calls the MCP server's `explain_circuit` tool over
   HTTP (the MCP server is the one thing that stays a separate long-lived process)

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

# MEMORY-MCP.md
> MCP server domain memory.

## Transport Modes
- stdio → Bob runs server as subprocess, default local mode
- HTTP SSE → `--http` flag, port 8765, for Docker/remote demos
- Config file Bob reads: `~/.bob/mcp-servers.json` (local) or env var `BOB_MCP_URL` (remote)

## Qiskit Integration
- Qiskit Code Assistant = local model only (granite-based), no cloud API
- Model served via `llama-cpp-python` or `ollama` (TBD — track in MEMORY-MCP.md)
- MCP tools to expose:
  - `run_circuit` → execute Qiskit circuit on simulator or real backend
  - `explain_circuit` → pass circuit to Qiskit Code Assistant for explanation
  - `list_backends` → list available IBM Quantum backends
  - `render_animation` → trigger Manim render for a scene

## Docker Image
- Image: `ghcr.io/YOUR_ORG/bob4q-mcp:latest`
- Build context: `mcp-server/`
- Entrypoint default: HTTP mode (for container use)
- Override to stdio: `docker run ... /app/server.py` (not useful in container, stdio only for local)

## Open Questions
- [ ] Ollama vs llama-cpp-python for local model serving
- [ ] IBM Quantum real backend auth in workshop context (API key distribution)
- [ ] Model size for Qiskit Code Assistant — min 8GB RAM?

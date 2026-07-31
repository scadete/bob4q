# MEMORY-MCP.md
> MCP server domain memory.

## Transport Modes
- stdio → Bob runs server as subprocess, default local mode
- HTTP SSE → `--http` flag, port 8765, for Docker/remote demos
- Config file Bob reads: `~/.bob/mcp-servers.json` (local) or env var `BOB_MCP_URL` (remote)

## Qiskit Integration
- Qiskit Code Assistant = local model only (granite-based), no cloud API
- Model served via **Ollama** — participants run `ollama pull ibm-granite/...` pre-workshop
- MCP server calls Ollama via `httpx` (OpenAI-compatible endpoint at `http://localhost:11434`)
- MCP tools to expose:
  - `run_circuit` → execute Qiskit circuit on simulator or real backend
  - `explain_circuit` → pass circuit to Qiskit Code Assistant (via Ollama) for explanation
  - `list_backends` → list available IBM Quantum backends

## Container Image
- Image: `ghcr.io/YOUR_ORG/bob4q-mcp:latest`
- Build context: `mcp-server/`
- Entrypoint default: HTTP mode (for container use)
- Ollama runs separately (participants install locally or pull `ollama/ollama` container)

## Granite Model Tag
- Using `granite3.1-dense:8b` — Granite 3.1 Dense 8B instruct model
- Available via `ollama pull granite3.1-dense:8b`
- Configurable via `GRANITE_MODEL` env var in all services

## Open Questions
- [ ] IBM Quantum real backend auth in workshop context (API key distribution)
- [x] Minimum hardware: 8 GB+ RAM confirmed for Granite 8B via Ollama

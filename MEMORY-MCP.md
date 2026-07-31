# MEMORY-MCP.md
> MCP server domain memory.

## Transport Modes
- stdio → Bob runs server as subprocess, default local mode
- HTTP SSE → `--http` flag, port 8765, for Docker/remote demos
- Config file Bob reads: `~/.bob/mcp-servers.json` (local) or env var `BOB_MCP_URL` (remote)

## Scope
- The MCP server **only wraps the local Qiskit Code Assistant** (Granite via Ollama). No other use for now.
- Circuit execution and backend listing live in the **FastAPI backend** (`/api/circuit/run`, `/api/backends`) — NOT the MCP server.

## Qiskit Code Assistant Integration
- Qiskit Code Assistant = local model only (granite-based), no cloud API
- Model served via **Ollama** — participants run `ollama pull granite3.1-dense:8b` pre-workshop
- MCP server calls Ollama via `httpx` (OpenAI-compatible endpoint at `http://localhost:11434`)
- MCP tool exposed:
  - `explain_circuit` → pass circuit to Qiskit Code Assistant (via Ollama) for explanation

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

# IBM Bob Setup Guide — Qiskit Code Assistant + Ollama

This guide walks you through setting up IBM Bob with the Qiskit Code Assistant model via Ollama for the **bob4q** workshop.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| [Bob (IBM extension for VS Code)](https://marketplace.visualstudio.com/items?itemName=IBM.ibm-developer) | latest | VS Code Marketplace |
| [Ollama](https://ollama.com/download) | ≥ 0.3 | ollama.com/download |

---

## 1. Install Ollama

### macOS
```bash
brew install ollama
```

### Windows
Download and run the installer from [ollama.com/download](https://ollama.com/download).

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

## 2. Pull the Granite Model

The Qiskit Code Assistant is served by the **Granite 3.1** model family via Ollama:

```bash
ollama pull granite3.1-dense:8b
```

> **Note:** This downloads ~5 GB. Run this before the workshop to avoid slow downloads.
>
> **Hardware requirement:** ≥ 8 GB RAM recommended for comfortable inference speed.

Verify the model is available:
```bash
ollama list
```

You should see `granite3.1-dense:8b` in the list.

---

## 3. Start the MCP Server

From the repo root:

```bash
cd mcp-server
uv run server.py
```

This starts the MCP server in **stdio mode** — IBM Bob will automatically connect to it.

---

## 4. Configure Bob

The MCP server (`explain_circuit`) can run **locally** on your own machine, or **remotely** on a
shared host — same tool either way, just a different transport. Point Bob's config at whichever
fits your setup.

### Local (stdio) — one server per participant

Open VS Code settings (`Cmd/Ctrl + ,`) and add the MCP server configuration:

```json
{
  "bob.mcpServers": {
    "bob4q": {
      "command": "uv",
      "args": ["run", "python", "server.py"],
      "cwd": "/path/to/bob4q/mcp-server"
    }
  }
}
```

Replace `/path/to/bob4q` with the actual path to this repository.

### Remote (HTTP) — one shared server for a room

Start the server in HTTP mode on the shared host (see `mcp-server/server.py`'s `--http` flag):

```bash
cd mcp-server
uv run server.py --http --port 8765
```

Then point Bob at the remote URL instead of a local command:

```json
{
  "bob.mcpServers": {
    "bob4q": {
      "url": "http://<shared-host>:8765/sse"
    }
  }
}
```

This is the option to use when Ollama/Granite is too heavy to run on every participant's laptop
— host one instance and have everyone's Bob connect to it.

---

## 5. Verify the Connection

Open Bob in VS Code and ask it:

> "Use the `explain_circuit` tool to explain this circuit: `qc = QuantumCircuit(1); qc.h(0)`."

You should get back a plain-language explanation of the Hadamard gate.

---

## Container Mode (Podman / Docker)

If you prefer not to install Ollama locally, use the container stack:

```bash
podman compose up
```

This automatically pulls the Granite model and starts all services. No local Ollama installation required.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ollama: command not found` | Check that Ollama is installed and in your PATH |
| Model pull fails | Ensure you have a stable internet connection and ≥ 10 GB free disk space |
| Bob cannot connect to MCP server | Verify `uv run server.py` is running; check VS Code Bob extension logs |
| `explain_circuit` returns an error | Make sure `ollama serve` is running (`ollama list` should work) |

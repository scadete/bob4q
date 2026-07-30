# IBM Bob Configuration — Workshop Setup

## Local Mode (stdio)

Add to your Bob MCP configuration (`~/.bob/mcp-servers.json` or via Bob settings UI):

```json
{
  "mcpServers": {
    "bob4q": {
      "command": "uv",
      "args": ["run", "server.py"],
      "cwd": "/path/to/bob4q/mcp-server"
    }
  }
}
```

## Remote/Docker Mode (HTTP SSE)

If the MCP server is running in a container:

```json
{
  "mcpServers": {
    "bob4q": {
      "url": "http://localhost:8765/sse"
    }
  }
}
```

## Available MCP Tools

Once connected, Bob gains access to:

| Tool | Description |
|------|-------------|
| `run_circuit` | Execute a Qiskit circuit on simulator or real QPU |
| `explain_circuit` | Get AI explanation of a circuit (local model) |
| `list_backends` | List available IBM Quantum backends |
| `render_animation` | Trigger a Manim scene render |

## Verifying Connection

In Bob, ask: *"List available quantum backends"* — Bob should call `list_backends` and return a list.

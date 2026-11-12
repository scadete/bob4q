"""
bob4q MCP Server — wraps the local Qiskit Code Assistant (Granite via Ollama).

Circuit execution happens in-process inside each notebook (notebooks/lib/backend.py), not here.

Transport modes:
  stdio (default) — IBM Bob spawns this as a subprocess
  HTTP SSE        — run with --http for container/remote demo

Usage:
  uv run server.py           # stdio mode
  uv run server.py --http    # HTTP SSE mode on port 8765
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import os
from typing import Any

import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolRequest,
    CallToolResult,
    ListToolsRequest,
    ListToolsResult,
    TextContent,
    Tool,
)

logger = logging.getLogger(__name__)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
GRANITE_MODEL = os.getenv("GRANITE_MODEL", "granite3.1-dense:8b")

# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------


async def explain_circuit(code: str) -> str:
    """MCP tool: explain a Qiskit circuit using Qiskit Code Assistant via Ollama,
    with an automatic fallback for beginner workshops when Ollama is offline."""
    prompt = (
        "You are Qiskit Code Assistant, an expert in quantum computing and Qiskit. "
        "Explain the following Qiskit circuit code clearly and concisely for a "
        "workshop participant who is new to programming:\n\n"
        f"```python\n{code}\n```"
    )
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                f"{OLLAMA_HOST}/v1/chat/completions",
                json={
                    "model": GRANITE_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.info("Ollama assistant unavailable (%s); returning offline beginner explanation.", e)
        # Built-in beginner-friendly fallback
        parts = [
            "💡 **IBM Bob's Quantum Guide** (Offline Assistant Mode):",
            "",
            "Here is the plain-English breakdown of your circuit:",
        ]
        if "QuantumCircuit" in code:
            parts.append("- `QuantumCircuit`: Allocates your qubits (quantum bits) and classical readout bits.")
        if ".h(" in code or "h(" in code:
            parts.append("- `h` (Hadamard): Spins the qubit into 50/50 superposition (like a spinning coin in mid-air).")
        if ".cx(" in code or "cx(" in code:
            parts.append("- `cx` (CNOT): Entangles two qubits into synchronized magic twins (measuring one matches the other).")
        if ".measure" in code:
            parts.append("- `measure`: Catches the spinning coin to read out the final 0 or 1 result.")
        parts.append("\n*Note: Running in zero-setup offline mode. Start Ollama with Granite to enable live generative AI responses.*")
        return "\n".join(parts)


# ---------------------------------------------------------------------------
# MCP Server setup
# ---------------------------------------------------------------------------

TOOLS: list[Tool] = [
    Tool(
        name="explain_circuit",
        description=(
            "Explain a Qiskit circuit using Qiskit Code Assistant (via Ollama Granite model)."
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Python Qiskit circuit code to explain",
                }
            },
            "required": ["code"],
        },
    ),
]


def create_server() -> Server:
    server = Server("bob4q-mcp")

    async def handle_list_tools(request: ListToolsRequest) -> ListToolsResult:
        return ListToolsResult(tools=TOOLS)

    async def handle_call_tool(request: CallToolRequest) -> CallToolResult:
        name = request.params.name
        arguments = request.params.arguments or {}
        try:
            if name == "explain_circuit":
                explanation = await explain_circuit(code=arguments["code"])
                return CallToolResult(content=[TextContent(type="text", text=explanation)])
            else:
                return CallToolResult(
                    content=[TextContent(type="text", text=f"Unknown tool: {name}")],
                    is_error=True,
                )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Tool '%s' raised an error", name)
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error: {exc}")],
                is_error=True,
            )

    server.add_request_handler("tools/list", ListToolsRequest, handle_list_tools)
    server.add_request_handler("tools/call", CallToolRequest, handle_call_tool)

    return server


# ---------------------------------------------------------------------------
# HTTP SSE transport (FastAPI)
# ---------------------------------------------------------------------------


def start_http(port: int) -> None:
    """Start the MCP server over HTTP SSE transport using FastAPI."""
    import uvicorn
    from fastapi import FastAPI
    from fastapi.responses import StreamingResponse
    from mcp.server.sse import SseServerTransport

    app = FastAPI(title="bob4q MCP Server (HTTP)")
    server = create_server()
    sse = SseServerTransport("/messages")

    @app.get("/sse")
    async def sse_endpoint() -> StreamingResponse:
        async with sse.connect_sse(None, None) as streams:  # type: ignore[arg-type]
            await server.run(*streams, server.create_initialization_options())
        return StreamingResponse(iter([]), media_type="text/event-stream")

    app.mount("/messages", sse.handle_post_message)

    # Health endpoint so Compose health-checks work
    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    # Tool call REST endpoint (for backend proxy)
    @app.post("/tools/{tool_name}")
    async def call_tool_rest(tool_name: str, body: dict[str, Any]) -> Any:
        if tool_name not in {t.name for t in TOOLS}:
            return {"error": f"Tool '{tool_name}' not found"}
        request = CallToolRequest(params={"name": tool_name, "arguments": body})
        result: CallToolResult = await server._request_handlers["tools/call"].handler(  # noqa: SLF001
            request
        )
        first = result.content[0] if result.content else None
        return {"result": first.text if isinstance(first, TextContent) else ""}

    logger.info("Starting MCP HTTP SSE server on port %d", port)
    uvicorn.run(app, host="0.0.0.0", port=port)  # noqa: S104


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="bob4q MCP Server")
    parser.add_argument(
        "--http", action="store_true", help="Use HTTP SSE transport instead of stdio"
    )
    parser.add_argument("--port", type=int, default=8765, help="Port for HTTP transport")
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    if args.http:
        start_http(args.port)
    else:
        logger.info("Starting MCP server in stdio mode")
        server = create_server()
        async with stdio_server() as (read_stream, write_stream):
            await server.run(
                read_stream,
                write_stream,
                server.create_initialization_options(),
            )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())

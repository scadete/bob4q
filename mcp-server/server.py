"""
bob4q MCP Server — wraps the local Qiskit Code Assistant (Granite via Ollama).

Circuit execution is handled by the FastAPI backend, not here.

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
from mcp.types import TextContent, Tool

logger = logging.getLogger(__name__)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
GRANITE_MODEL = os.getenv("GRANITE_MODEL", "granite3.1-dense:8b")

# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------


async def explain_circuit(code: str) -> str:
    """MCP tool: explain a Qiskit circuit using Qiskit Code Assistant via Ollama."""
    prompt = (
        "You are Qiskit Code Assistant, an expert in quantum computing and Qiskit. "
        "Explain the following Qiskit circuit code clearly and concisely for a workshop participant:\n\n"
        f"```python\n{code}\n```"
    )
    async with httpx.AsyncClient(timeout=60.0) as client:
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


# ---------------------------------------------------------------------------
# MCP Server setup
# ---------------------------------------------------------------------------

TOOLS: list[Tool] = [
    Tool(
        name="explain_circuit",
        description="Explain a Qiskit circuit using Qiskit Code Assistant (via Ollama Granite model).",
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

    @server.list_tools()
    async def handle_list_tools() -> list[Tool]:
        return TOOLS

    @server.call_tool()
    async def handle_call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
        try:
            if name == "explain_circuit":
                explanation = await explain_circuit(code=arguments["code"])
                return [TextContent(type="text", text=explanation)]

            else:
                return [TextContent(type="text", text=f"Unknown tool: {name}")]

        except Exception as exc:  # noqa: BLE001
            logger.exception("Tool '%s' raised an error", name)
            return [TextContent(type="text", text=f"Error: {exc}")]

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
        server_instance = create_server()
        handler = server_instance._tool_handlers.get(tool_name)  # noqa: SLF001
        if handler is None:
            return {"error": f"Tool '{tool_name}' not found"}
        results = await handler(tool_name, body)
        return {"result": results[0].text if results else ""}

    logger.info("Starting MCP HTTP SSE server on port %d", port)
    uvicorn.run(app, host="0.0.0.0", port=port)  # noqa: S104


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="bob4q MCP Server")
    parser.add_argument("--http", action="store_true", help="Use HTTP SSE transport instead of stdio")
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

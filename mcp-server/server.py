"""
bob4q MCP Server — Qiskit + Qiskit Code Assistant integration.

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
import json
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
IBMQ_API_TOKEN = os.getenv("IBMQ_API_TOKEN", "")

# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------


def _run_circuit_sync(code: str, backend: str) -> dict[str, Any]:
    """Execute a Qiskit circuit and return measurement counts."""
    local_ns: dict[str, Any] = {}
    exec(code, {"__builtins__": __builtins__}, local_ns)  # noqa: S102

    qc = local_ns.get("qc")
    if qc is None:
        return {"error": "Circuit code must assign a QuantumCircuit to 'qc'"}

    if backend in ("aer_simulator", "ibmq_qasm_simulator"):
        from qiskit_aer import AerSimulator  # type: ignore[import]
        from qiskit import transpile  # type: ignore[import]

        sim = AerSimulator()
        compiled = transpile(qc, sim)
        job = sim.run(compiled, shots=1024)
        result = job.result()
        counts = dict(result.get_counts())
        return {"backend": "aer_simulator", "counts": counts, "shots": 1024}

    # Real IBM Quantum backend path
    if not IBMQ_API_TOKEN:
        return {"error": "IBMQ_API_TOKEN not set — cannot use real QPU"}

    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler  # type: ignore[import]
    from qiskit import transpile  # type: ignore[import]

    service = QiskitRuntimeService(token=IBMQ_API_TOKEN)
    ibm_backend = service.backend(backend)
    compiled = transpile(qc, ibm_backend)
    sampler = Sampler(ibm_backend)
    job = sampler.run([compiled])
    result = job.result()
    counts = dict(result[0].data.meas.get_counts())
    return {"backend": backend, "counts": counts}


async def run_circuit(code: str, backend: str = "aer_simulator") -> dict[str, Any]:
    """MCP tool: execute a Qiskit circuit."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_circuit_sync, code, backend)


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


def list_backends() -> list[str]:
    """MCP tool: return available backends."""
    backends = ["aer_simulator"]
    if IBMQ_API_TOKEN:
        try:
            from qiskit_ibm_runtime import QiskitRuntimeService  # type: ignore[import]

            service = QiskitRuntimeService(token=IBMQ_API_TOKEN)
            backends += [b.name for b in service.backends()]
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not fetch IBM backends: %s", exc)
    return backends


# ---------------------------------------------------------------------------
# MCP Server setup
# ---------------------------------------------------------------------------

TOOLS: list[Tool] = [
    Tool(
        name="run_circuit",
        description="Execute a Qiskit quantum circuit on a simulator or real IBM Quantum backend.",
        inputSchema={
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Python code that builds a QuantumCircuit assigned to variable 'qc'",
                },
                "backend": {
                    "type": "string",
                    "description": "Backend name (default: aer_simulator)",
                    "default": "aer_simulator",
                },
            },
            "required": ["code"],
        },
    ),
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
    Tool(
        name="list_backends",
        description="List available quantum computing backends (simulator + IBM Quantum if token set).",
        inputSchema={"type": "object", "properties": {}},
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
            if name == "run_circuit":
                result = await run_circuit(
                    code=arguments["code"],
                    backend=arguments.get("backend", "aer_simulator"),
                )
                return [TextContent(type="text", text=json.dumps(result, indent=2))]

            elif name == "explain_circuit":
                explanation = await explain_circuit(code=arguments["code"])
                return [TextContent(type="text", text=explanation)]

            elif name == "list_backends":
                backends = list_backends()
                return [TextContent(type="text", text=json.dumps(backends))]

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

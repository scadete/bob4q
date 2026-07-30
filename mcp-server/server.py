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
import logging

logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="bob4q MCP Server")
    parser.add_argument("--http", action="store_true", help="Use HTTP SSE transport instead of stdio")
    parser.add_argument("--port", type=int, default=8765, help="Port for HTTP transport")
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    # TODO: initialize MCP server with tools
    # TODO: register tools: run_circuit, explain_circuit, list_backends, render_animation
    if args.http:
        logger.info("Starting MCP server in HTTP SSE mode on port %d", args.port)
        # TODO: start HTTP SSE transport
    else:
        logger.info("Starting MCP server in stdio mode")
        # TODO: start stdio transport


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())

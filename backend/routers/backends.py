"""Backends listing router."""

from __future__ import annotations

import os

import httpx
from fastapi import APIRouter

router = APIRouter(tags=["backends"])

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8765")


@router.get("/backends")
async def list_backends() -> list[str]:
    """Proxy list_backends from the MCP server (falls back to defaults)."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                f"{MCP_SERVER_URL}/tools/list_backends",
                json={},
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("backends", [])
    except Exception:  # noqa: BLE001
        # Fallback when MCP server is unavailable
        return ["aer_simulator", "ibmq_qasm_simulator"]

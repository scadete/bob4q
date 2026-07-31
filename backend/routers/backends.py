"""Backends listing router."""

from __future__ import annotations

import logging
import os

from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["backends"])

IBMQ_API_TOKEN = os.getenv("IBMQ_API_TOKEN", "")


@router.get("/backends")
async def list_backends() -> list[str]:
    """List available quantum backends: the local Aer simulator, plus IBM
    Quantum backends when IBMQ_API_TOKEN is set."""
    backends = ["aer_simulator"]
    if IBMQ_API_TOKEN:
        try:
            from qiskit_ibm_runtime import QiskitRuntimeService  # type: ignore[import]

            service = QiskitRuntimeService(token=IBMQ_API_TOKEN)
            backends += [b.name for b in service.backends()]
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not fetch IBM backends: %s", exc)
    return backends

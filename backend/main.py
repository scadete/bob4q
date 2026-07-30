"""FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(
    title="bob4q Backend API",
    description="Quantum circuit execution API for the bob4q workshop lab",
    version="0.1.0",
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


# TODO: mount routers
# from .routers import circuit, backends
# app.include_router(circuit.router, prefix="/api/circuit")
# app.include_router(backends.router, prefix="/api/backends")

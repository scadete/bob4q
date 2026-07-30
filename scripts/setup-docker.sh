#!/usr/bin/env sh
# Workshop participant setup — container mode (macOS / Linux)
# For Windows use: scripts\setup-container.ps1
#
# Prerequisites: Podman + podman-compose  (recommended)
#   macOS/Windows: https://podman-desktop.io
#   Linux:         sudo apt install podman && pip install podman-compose
#
# Docker fallback: replace 'podman' with 'docker' throughout

set -e

# Detect podman or fall back to docker
COMPOSE_CMD="podman compose"
if ! command -v podman >/dev/null 2>&1; then
  echo "  podman not found, falling back to docker compose"
  COMPOSE_CMD="docker compose"
fi

echo "==> Copying .env.example to .env..."
cp -n .env.example .env 2>/dev/null || echo "  .env already exists, skipping"

echo "==> Pulling/building images..."
$COMPOSE_CMD pull --ignore-buildable 2>/dev/null || true
$COMPOSE_CMD build

echo ""
echo "Setup complete!"
echo ""
echo "To start the workshop environment:"
echo "  $COMPOSE_CMD up"
echo ""
echo "Services:"
echo "  Frontend → http://localhost:3000"
echo "  Backend  → http://localhost:8000/docs"
echo "  MCP      → http://localhost:8765"

#!/usr/bin/env sh
# Workshop participant setup — local mode (macOS / Linux)
# For Windows use: scripts\setup.ps1
#
# Prerequisites: Python 3.11+, Node 20+, pnpm 9+, uv
# Install uv:   curl -LsSf https://astral.sh/uv/install.sh | sh
# Install pnpm: npm install -g pnpm

set -e

echo "==> Checking prerequisites..."
sh "$(dirname "$0")/check-prereqs.sh" || {
  echo ""
  echo "Please fix the above prerequisites before continuing."
  exit 1
}

echo "==> Installing JS dependencies..."
pnpm install

echo "==> Setting up MCP server Python env..."
cd mcp-server && uv sync && cd ..

echo "==> Setting up backend Python env..."
cd backend && uv sync && cd ..

echo "==> Setting up Manim Python env..."
cd manim && uv sync && cd ..

echo "==> Copying .env.example to .env..."
cp -n .env.example .env 2>/dev/null || echo "  .env already exists, skipping"

echo ""
echo "Setup complete!"
echo ""
echo "To start the workshop environment:"
echo "  Terminal 1 (MCP server):  cd mcp-server && uv run server.py"
echo "  Terminal 2 (Backend API): cd backend && uv run uvicorn main:app --reload"
echo "  Terminal 3 (Frontend):    pnpm dev"
echo ""
echo "Or use Podman Compose: podman compose up"

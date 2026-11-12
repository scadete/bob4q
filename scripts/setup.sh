#!/usr/bin/env sh
# Workshop participant setup — local mode (macOS / Linux)
# For Windows use: scripts\setup.ps1
#
# Prerequisites: Python 3.11+, Node 20+, pnpm 9+, uv
# Install uv:   curl -LsSf https://astral.sh/uv/install.sh | sh
# Install pnpm: npm install -g pnpm
#
# Note: manim/ is not a Python package — its scenes are read-only reference
# specs for the CSS/JS animations (see manim/README.md). Nothing to install.

set -e

cd "$(dirname "$0")/.."

echo "==> Checking prerequisites..."
sh scripts/check-prereqs.sh || {
  echo ""
  echo "Please fix the above prerequisites before continuing."
  exit 1
}

echo "==> Installing JS dependencies..."
pnpm install

echo "==> Setting up MCP server Python env..."
# Subshell so a failing `uv sync` aborts the script (set -e ignores
# failures in the middle of `a && b && c` chains).
(cd mcp-server && uv sync)

echo "==> Copying .env.example to .env..."
if [ -f .env ]; then
  echo "  .env already exists, skipping"
else
  cp .env.example .env
  echo "  .env created from .env.example"
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start the workshop environment:"
echo "  Terminal 1 (MCP server):  cd mcp-server && uv run server.py"
echo "  Terminal 2 (Frontend):    pnpm dev"
echo ""
echo "Notebooks run locally in Jupyter — see each notebook's intro cell for its uv command."
echo ""
echo "Or use Podman Compose: podman compose up"

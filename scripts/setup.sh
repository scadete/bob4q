# Workshop participant setup — local mode
# Prerequisites: Python 3.11+, Node 20+, pnpm 9+, uv

set -e

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
echo "✓ Setup complete!"
echo ""
echo "To start the workshop environment:"
echo "  Terminal 1 (MCP server):  cd mcp-server && uv run server.py"
echo "  Terminal 2 (Backend API): cd backend && uv run uvicorn main:app --reload"
echo "  Terminal 3 (Frontend):    pnpm dev"
echo ""
echo "Or use Docker Compose: docker compose up"

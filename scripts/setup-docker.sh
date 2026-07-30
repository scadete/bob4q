# Workshop participant setup — Docker mode
# Prerequisites: Docker with Compose plugin

set -e

echo "==> Copying .env.example to .env..."
cp -n .env.example .env 2>/dev/null || echo "  .env already exists, skipping"

echo "==> Pulling/building images..."
docker compose pull --ignore-buildable
docker compose build

echo ""
echo "✓ Setup complete!"
echo ""
echo "To start the workshop environment:"
echo "  docker compose up"
echo ""
echo "Services:"
echo "  Frontend → http://localhost:3000"
echo "  Backend  → http://localhost:8000/docs"
echo "  MCP      → http://localhost:8765"

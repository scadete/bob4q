# Workshop participant setup — local mode (Windows)
# Run in PowerShell as a regular user (no admin required)
#
# Prerequisites: Python 3.11+, Node 20+, pnpm 9+, uv
#   Install uv:   winget install astral-sh.uv
#   Install pnpm: npm install -g pnpm
#   Or use: https://nodejs.org  and  https://docs.astral.sh/uv/getting-started/installation/

$ErrorActionPreference = "Stop"

Write-Host "==> Checking prerequisites..."
& "$PSScriptRoot\check-prereqs.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Please fix the above prerequisites before continuing."
    exit 1
}

Write-Host "==> Installing JS dependencies..."
pnpm install

Write-Host "==> Setting up MCP server Python env..."
Push-Location mcp-server; uv sync; Pop-Location

Write-Host "==> Setting up backend Python env..."
Push-Location backend; uv sync; Pop-Location

Write-Host "==> Setting up Manim Python env..."
Push-Location manim; uv sync; Pop-Location

Write-Host "==> Copying .env.example to .env..."
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  .env created from .env.example"
} else {
    Write-Host "  .env already exists, skipping"
}

Write-Host ""
Write-Host "Setup complete!"
Write-Host ""
Write-Host "To start the workshop environment:"
Write-Host "  Terminal 1 (MCP server):  cd mcp-server; uv run server.py"
Write-Host "  Terminal 2 (Backend API): cd backend; uv run uvicorn main:app --reload"
Write-Host "  Terminal 3 (Frontend):    pnpm dev"
Write-Host ""
Write-Host "Or use Podman Compose: podman compose up"

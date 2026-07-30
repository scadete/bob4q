# Workshop participant setup — container mode (Windows)
# Run in PowerShell as a regular user (no admin required)
#
# Prerequisites: Podman Desktop (recommended)
#   Download: https://podman-desktop.io
#
# Docker fallback: replace 'podman' with 'docker' in this script

$ErrorActionPreference = "Stop"

# Detect podman or fall back to docker
$ComposeCmd = @("podman", "compose")
if (-not (Get-Command podman -ErrorAction SilentlyContinue)) {
    Write-Host "  podman not found, falling back to docker compose"
    $ComposeCmd = @("docker", "compose")
}

Write-Host "==> Copying .env.example to .env..."
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  .env created from .env.example"
} else {
    Write-Host "  .env already exists, skipping"
}

Write-Host "==> Building images..."
& $ComposeCmd[0] $ComposeCmd[1] build

Write-Host ""
Write-Host "Setup complete!"
Write-Host ""
Write-Host "To start the workshop environment:"
Write-Host "  $($ComposeCmd -join ' ') up"
Write-Host ""
Write-Host "Services:"
Write-Host "  Frontend -> http://localhost:3000"
Write-Host "  Backend  -> http://localhost:8000/docs"
Write-Host "  MCP      -> http://localhost:8765"

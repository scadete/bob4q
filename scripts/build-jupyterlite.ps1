# scripts/build-jupyterlite.ps1
# ---------------------------------------------------------------------------
# Build a JupyterLite static site with the starter notebook baked in, then
# copy the output to frontend/public/jupyterlite/ so Next.js serves it.
#
# Usage (from repo root, PowerShell):
#   .\scripts\build-jupyterlite.ps1
#
# Requirements: uv (https://docs.astral.sh/uv/) — no other installs needed.
# jupyterlite-core and jupyterlite-pyodide-kernel are fetched by uv on demand.
# ---------------------------------------------------------------------------
$ErrorActionPreference = "Stop"

$RepoRoot  = (Get-Item "$PSScriptRoot\..").FullName
$Notebooks = Join-Path $RepoRoot "notebooks"
$BuildDir  = Join-Path $RepoRoot ".jupyterlite_build"
# Separate scratch dir for jupyter-lite config/cache (must differ from BuildDir)
$LiteDir   = Join-Path $RepoRoot ".jupyterlite_config"
$OutputDir = Join-Path $RepoRoot "frontend\public\jupyterlite"

Write-Host "==> Building JupyterLite static site..."
Write-Host "    Notebooks:  $Notebooks"
Write-Host "    Lite dir:   $LiteDir"
Write-Host "    Build tmp:  $BuildDir"
Write-Host "    Output:     $OutputDir"
Write-Host ""

# Clean previous build
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
if (Test-Path $LiteDir)  { Remove-Item -Recurse -Force $LiteDir }
New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null
New-Item -ItemType Directory -Force -Path $LiteDir  | Out-Null

# Use uv to run jupyter-lite in a temporary isolated env.
# No global pip install required — uv pulls the packages on demand.
uv run `
  --with jupyterlite-core `
  --with jupyterlite-pyodide-kernel `
  --with jupyter-server `
  jupyter lite build `
    --contents $Notebooks `
    --lite-dir $LiteDir `
    --output-dir $BuildDir

# Copy built site to Next.js public directory
if (Test-Path $OutputDir) { Remove-Item -Recurse -Force $OutputDir }
Copy-Item -Recurse $BuildDir $OutputDir

Write-Host ""
Write-Host "==> JupyterLite built -> $OutputDir"
Write-Host "    Restart 'pnpm dev' (or rebuild) to pick up the new static files."

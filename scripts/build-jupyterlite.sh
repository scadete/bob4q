#!/usr/bin/env sh
# scripts/build-jupyterlite.sh
# ---------------------------------------------------------------------------
# Build a JupyterLite static site with the starter notebook baked in, then
# copy the output to frontend/public/jupyterlite/ so Next.js serves it.
#
# Usage (from repo root):
#   sh scripts/build-jupyterlite.sh
#
# Requirements: uv (https://docs.astral.sh/uv/) — no other installs needed.
# jupyterlite-core and jupyterlite-pyodide-kernel are fetched by uv on demand.
# ---------------------------------------------------------------------------
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NOTEBOOKS_DIR="$REPO_ROOT/notebooks"
OUTPUT_DIR="$REPO_ROOT/frontend/public/jupyterlite"
BUILD_DIR="$REPO_ROOT/.jupyterlite_build"
# Separate scratch dir for jupyter-lite config/cache (must differ from --output-dir)
LITE_DIR="$REPO_ROOT/.jupyterlite_config"

echo "==> Building JupyterLite static site…"
echo "    Notebooks:  $NOTEBOOKS_DIR"
echo "    Lite dir:   $LITE_DIR"
echo "    Build tmp:  $BUILD_DIR"
echo "    Output:     $OUTPUT_DIR"
echo ""

# Clean previous build artefacts
rm -rf "$BUILD_DIR" "$LITE_DIR"
mkdir -p "$BUILD_DIR" "$LITE_DIR"

# Use uv to run jupyter-lite in a temporary isolated env.
# No global pip install required — uv pulls the packages on demand.
uv run \
  --with jupyterlite-core \
  --with jupyterlite-pyodide-kernel \
  jupyter lite build \
    --contents "$NOTEBOOKS_DIR" \
    --lite-dir "$LITE_DIR" \
    --output-dir "$BUILD_DIR"

# Copy built site to Next.js public directory
rm -rf "$OUTPUT_DIR"
cp -r "$BUILD_DIR" "$OUTPUT_DIR"

echo ""
echo "==> JupyterLite built → $OUTPUT_DIR"
echo "    Restart 'pnpm dev' (or rebuild) to pick up the new static files."

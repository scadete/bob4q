#!/usr/bin/env sh
# Check all prerequisites for the bob4q workshop (local mode).
# Exits 0 if all pass, 1 if any are missing.
# Called automatically from setup.sh.

set -e

PASS=0
FAIL=1
all_ok=true

check() {
  name="$1"
  cmd="$2"
  version_flag="$3"
  min_note="$4"
  install_url="$5"

  if command -v "$cmd" >/dev/null 2>&1; then
    ver="$($cmd $version_flag 2>&1 | head -1)"
    printf "  ✓  %-20s %s\n" "$name" "$ver"
  else
    printf "  ✗  %-20s NOT FOUND  → Install: %s\n" "$name" "$install_url"
    all_ok=false
  fi
}

echo ""
echo "==============================="
echo "  bob4q — Prerequisites Check"
echo "==============================="
echo ""

check "Node.js (>=20)"  "node"   "--version"   "20.x"  "https://nodejs.org"
check "pnpm (>=9)"      "pnpm"   "--version"   "9.x"   "https://pnpm.io/installation"
check "Python (>=3.11)" "python3" "--version"  "3.11"  "https://python.org/downloads"
check "uv"              "uv"     "--version"   ""      "https://docs.astral.sh/uv/getting-started/installation/"
check "Ollama"          "ollama" "--version"   ""      "https://ollama.com/download"

# Podman or Docker
if command -v podman >/dev/null 2>&1; then
  printf "  ✓  %-20s %s\n" "Podman" "$(podman --version 2>&1 | head -1)"
elif command -v docker >/dev/null 2>&1; then
  printf "  ✓  %-20s %s\n" "Docker" "$(docker --version 2>&1 | head -1)"
else
  printf "  ✗  %-20s NOT FOUND  → Install: %s\n" "Podman / Docker" "https://podman-desktop.io"
  all_ok=false
fi

echo ""
if $all_ok; then
  echo "All prerequisites satisfied."
  exit $PASS
else
  echo "One or more prerequisites are missing. Install them and re-run this script."
  exit $FAIL
fi

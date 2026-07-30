#!/usr/bin/env sh
# Render all Manim scenes at high quality and copy to frontend/public/videos/.
# Run from the repo root: sh scripts/render-all.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIM_DIR="$REPO_ROOT/manim"
VIDEOS_OUT="$REPO_ROOT/frontend/public/videos"

mkdir -p "$VIDEOS_OUT"

SCENES="
qubit.py:QubitScene:qubit.mp4
superposition.py:SuperpositionScene:superposition.mp4
entanglement.py:EntanglementScene:entanglement.mp4
"

cd "$MANIM_DIR"

for entry in $SCENES; do
  [ -z "$entry" ] && continue
  scene_file="$(echo "$entry" | cut -d: -f1)"
  scene_class="$(echo "$entry" | cut -d: -f2)"
  output_name="$(echo "$entry" | cut -d: -f3)"

  echo "==> Rendering $scene_class from $scene_file ..."
  uv run manim render "scenes/$scene_file" "$scene_class" -qh

  # Locate the rendered file (Manim puts it inside media/videos/<stem>/<quality>/)
  stem="$(echo "$scene_file" | sed 's/\.py$//')"
  rendered="$(find "$MANIM_DIR/media/videos/$stem" -name "${scene_class}.mp4" | head -1)"

  if [ -z "$rendered" ]; then
    echo "  WARNING: rendered file not found for $scene_class"
  else
    cp "$rendered" "$VIDEOS_OUT/$output_name"
    echo "  Copied to $VIDEOS_OUT/$output_name"
  fi
done

echo ""
echo "All scenes rendered. Videos in $VIDEOS_OUT"

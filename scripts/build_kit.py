#!/usr/bin/env python3
"""Build frontend/public/kit/bob4q-kit.zip: the take-home kit for the workshop.

Run from anywhere: python3 scripts/build_kit.py
Contents: .bob/ (mcp.json, a beginner-mentoring rule, skills), notebooks/, examples/, README-HOME.md.
Refuses to build if any file contains a key pattern.
"""

from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "frontend" / "public" / "kit" / "bob4q-kit.zip"
SECRET_RE = re.compile(rb"bob_prod_[A-Za-z0-9_\-]+|/home/[a-z]+/")

SOURCES: list[tuple[Path, str]] = [
    (ROOT / ".bob" / "mcp.json", ".bob/mcp.json"),
    (ROOT / "kit" / "README-HOME.md", "README-HOME.md"),
]


def add_tree(src: Path, prefix: str, patterns: tuple[str, ...]) -> None:
    for path in sorted(src.rglob("*")):
        if path.is_file() and "__pycache__" not in path.parts and path.match("*") and any(
            path.match(p) for p in patterns
        ):
            SOURCES.append((path, f"{prefix}/{path.relative_to(src).as_posix()}"))


SOURCES.append((ROOT / "kit" / "rules-agent-AGENTS.md", ".bob/rules-agent/AGENTS.md"))
add_tree(ROOT / ".bob" / "skills", ".bob/skills", ("*",))
add_tree(ROOT / "notebooks", "notebooks", ("*.ipynb", "*.py"))
add_tree(ROOT / "kit" / "examples", "examples", ("*.py",))


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for src, arc in SOURCES:
            data = src.read_bytes()
            if SECRET_RE.search(data):
                print(f"key or home path pattern in {src}, refusing to build", file=sys.stderr)
                return 1
            info = zipfile.ZipInfo(arc, date_time=(2026, 11, 12, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(info, data)
    print(f"wrote {OUT.relative_to(ROOT)}: {len(SOURCES)} files, {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

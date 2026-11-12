#!/usr/bin/env python3
"""Convert a `bob run --format stream-json` recording into a replay JSON.

Usage:
    python3 scripts/recording_to_replay.py RAW.jsonl OUT.json \
        --id uc1_coin --predict-answer 1 --bob-version 2.0.9 \
        --pin Qiskit/skills=d031f75 [--what-if uc1_coin_two_qubits] \
        [--prompt "text shown instead of the raw prompt"] \
        [--strip ABSOLUTE_PREFIX ...] [--animate STEP_INDEX=animationName ...]

Rules:
- Consecutive assistant chunks are joined into one `assistant` step.
- `use_skill` becomes a `skill` step. Other tool calls become `tool_call` plus a
  trimmed `tool_result`. `write_file` becomes `file`. Shell runs keep stdout only.
- Python logging lines in shell output are dropped (they are stderr noise).
- Absolute paths under the repo root and the home directory are rewritten.
- Nothing is invented: events that Bob did not emit (for example loaded rules)
  do not appear.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
MAX_RESULT_CHARS = 600
SECRET_RE = re.compile(r"bob_prod_[A-Za-z0-9_\-]+")


EXTRA_STRIP: list[str] = []
EXTRA_REDACT: list[str] = []


def scrub(text: str) -> str:
    for prefix in EXTRA_STRIP:
        text = text.replace(prefix.rstrip("/") + "/", "")
    text = text.replace(str(REPO_ROOT) + "/", "").replace(str(Path.home()), "~")
    for pattern in EXTRA_REDACT:
        text = re.sub(pattern, "<redacted>", text)
    return SECRET_RE.sub("<redacted>", text)


def trim(text: str, limit: int = MAX_RESULT_CHARS) -> str:
    text = scrub(text).strip()
    return text if len(text) <= limit else text[:limit].rstrip() + "\n..."


def docs_summary(output: str) -> str:
    """Reduce a docs-search JSON result to titles and URLs."""
    try:
        data = json.loads(output)
    except json.JSONDecodeError:
        return trim(output)
    lines = []
    for item in data.get("results", [])[:3]:
        title = item.get("title") or item.get("id", "")
        lines.append(f"{title}\n{item.get('url', '')}")
    return "\n".join(lines) or trim(output)


def page_summary(output: str) -> str:
    """Reduce a docs page fetch to its URL and the first lines of the page."""
    try:
        data = json.loads(output)
    except json.JSONDecodeError:
        return trim(output)
    if data.get("status") == "error":
        return f"error: {data.get('message', '')}"
    body = str(data.get("documentation", "")).strip().splitlines()
    return f"{data.get('url', '')}\n" + "\n".join(body[:6])


LOG_NOISE_RE = re.compile(r"^\S+:(WARNING|INFO|DEBUG):\d{4}-")


def shell_stdout(output: str) -> str:
    """Keep stdout only; drop Python logging lines (`logger:WARNING:timestamp: ...`)."""
    lines = output.split("Stderr:")[0].splitlines()
    return "\n".join(line for line in lines if not LOG_NOISE_RE.match(line)).strip()


def animation_for(step: dict[str, Any]) -> str | None:
    text = step.get("content") or step.get("text") or ""
    if step["type"] == "file" and re.search(r"\.h\(", text):
        return "gates"
    if step["type"] == "run_output" and re.search(r"\{\s*'[01]+'\s*:", text):
        return "resultsHistogram"
    return None


def convert(raw: Path, args: argparse.Namespace) -> dict[str, Any]:
    events = [json.loads(line) for line in raw.read_text().splitlines() if line.strip()]
    steps: list[dict[str, Any]] = []
    pending: dict[str, dict[str, Any]] = {}
    buffer: list[str] = []

    def flush() -> None:
        text = "".join(buffer).strip()
        buffer.clear()
        if text:
            steps.append({"type": "assistant", "text": scrub(text)})

    for ev in events:
        kind = ev.get("type")
        if kind == "message" and ev.get("role") == "assistant":
            buffer.append(ev.get("content", ""))
        elif kind == "message" and ev.get("role") == "user":
            flush()
            steps.append({"type": "prompt", "text": args.prompt or scrub(ev["content"])})
        elif kind == "tool_use":
            flush()
            name, params = ev["tool_name"], ev.get("parameters", {})
            pending[ev["tool_id"]] = ev
            if name == "update_todo_list":
                continue
            if name == "use_skill":
                steps.append({"type": "skill", "name": params["skill_name"]})
            elif name == "write_file":
                steps.append(
                    {
                        "type": "file",
                        "path": scrub(params["path"]),
                        "content": scrub(params["content"]),
                    }
                )
            elif name == "execute_command":
                steps.append(
                    {"type": "tool_call", "tool": "shell", "input": scrub(params["command"])}
                )
            elif name == "apply_diff":
                steps.append(
                    {
                        "type": "tool_call",
                        "tool": f"edit {scrub(params['path'])}",
                        "input": scrub(params["diff"]),
                    }
                )
            else:
                steps.append(
                    {"type": "tool_call", "tool": name, "input": scrub(json.dumps(params))}
                )
        elif kind == "tool_result":
            use = pending.get(ev.get("tool_id", ""))
            if use is None or ev.get("status") != "success":
                continue
            name = use["tool_name"]
            out = ev.get("output") or ""
            if name in ("use_skill", "write_file", "apply_diff", "update_todo_list"):
                continue
            if name == "execute_command":
                stdout = shell_stdout(out)
                if stdout and "Command completed with no output" not in stdout:
                    steps.append({"type": "run_output", "text": trim(stdout)})
            elif name == "update_todo_list":
                continue
            elif name.startswith("mcp__") and "get_page" in name:
                steps.append({"type": "tool_result", "text": trim(page_summary(out))})
            elif name.startswith("mcp__") and "search_docs" in name:
                steps.append({"type": "tool_result", "text": docs_summary(out)})
            else:
                steps.append({"type": "tool_result", "text": trim(out)})
    flush()

    # Drop shell housekeeping (mkdir) that adds no teaching value.
    cleaned: list[dict[str, Any]] = []
    for step in steps:
        if step["type"] == "tool_call" and step["input"].startswith("mkdir "):
            continue
        cleaned.append(step)
    for step in cleaned:
        anim = None if args.no_auto_animation else animation_for(step)
        if anim:
            step["animation"] = anim
    for spec in args.animate:
        index, name = spec.split("=", 1)
        cleaned[int(index)]["animation"] = name

    replay: dict[str, Any] = {
        "id": args.id,
        "source": "recorded",
        "bobVersion": args.bob_version,
        "recordedAt": events[0]["timestamp"][:10],
        "predictAnswer": args.predict_answer,
        "steps": cleaned,
    }
    if args.pin:
        replay["pins"] = dict(p.split("=", 1) for p in args.pin)
    if args.what_if:
        replay["whatIf"] = args.what_if
    return replay


def literal_secrets() -> list[str]:
    """Extra secret strings to refuse, from the REDACT_LITERALS env var (comma separated)."""
    import os

    return [x for x in os.environ.get("REDACT_LITERALS", "").split(",") if len(x) >= 8]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("raw", type=Path)
    ap.add_argument("out", type=Path)
    ap.add_argument("--id", required=True)
    ap.add_argument("--predict-answer", type=int, required=True)
    ap.add_argument("--bob-version", required=True)
    ap.add_argument("--pin", action="append", default=[], help="name=version, repeatable")
    ap.add_argument("--what-if")
    ap.add_argument("--prompt")
    ap.add_argument("--no-auto-animation", action="store_true", help="do not attach animations automatically")
    ap.add_argument("--redact", action="append", default=[], help="regex to replace with <redacted>")
    ap.add_argument("--strip", action="append", default=[], help="absolute path prefix to remove")
    ap.add_argument("--animate", action="append", default=[], help="STEP_INDEX=animationName")
    args = ap.parse_args()
    EXTRA_STRIP.extend(args.strip)
    EXTRA_REDACT.extend(args.redact)
    replay = convert(args.raw, args)
    text = json.dumps(replay, indent=2, ensure_ascii=False) + "\n"
    raw_text = args.raw.read_text()
    leaked = [x for x in literal_secrets() if x in text or x in raw_text]
    if leaked:
        print("literal secret found in recording or output, refusing to write", file=sys.stderr)
        return 1
    if SECRET_RE.search(text):
        print("secret pattern found, refusing to write", file=sys.stderr)
        return 1
    args.out.write_text(text)
    print(f"wrote {args.out} with {len(replay['steps'])} steps")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

import fs from "node:fs";
import path from "node:path";
import { parseReplay, type Replay } from "@/lib/replay-schema";

const REPLAY_DIR = path.join(process.cwd(), "content", "replays");

export function listReplayIds(): string[] {
  if (!fs.existsSync(REPLAY_DIR)) return [];
  return fs
    .readdirSync(REPLAY_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

export function loadReplay(id: string): Replay | null {
  if (!/^[a-z0-9_]+$/.test(id)) return null;
  const file = path.join(REPLAY_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return parseReplay(JSON.parse(fs.readFileSync(file, "utf8")));
}

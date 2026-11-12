import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseReplay } from "@/lib/replay-schema";

const dir = path.join(process.cwd(), "content", "replays");

describe("replay schema", () => {
  it("accepts every committed replay", () => {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const r = parseReplay(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
      expect(r.id).toBe(f.replace(/\.json$/, ""));
      if (r.whatIf) expect(files).toContain(`${r.whatIf}.json`);
    }
  });
  it("rejects an unknown step type", () => {
    expect(() => parseReplay({ id: "x", source: "sample", predictAnswer: 0, steps: [{ type: "bogus" }] })).toThrow();
  });
  it("rejects an unknown animation", () => {
    expect(() =>
      parseReplay({ id: "x", source: "sample", predictAnswer: 0, steps: [{ type: "prompt", text: "a", animation: "nope" }] }),
    ).toThrow();
  });
});

describe("replay pins", () => {
  it("accepts a pins map", () => {
    const r = parseReplay({ id: "x", source: "recorded", predictAnswer: 0, pins: { "Qiskit/skills": "abc1234" }, steps: [{ type: "prompt", text: "a" }] });
    expect(r.pins?.["Qiskit/skills"]).toBe("abc1234");
  });
});

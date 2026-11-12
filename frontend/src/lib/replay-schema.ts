import { z } from "zod";
import type { AnimationName } from "@/lib/animations";

/**
 * Replay schema: a recorded (or sample) Bob session, played back step by step.
 * Pure module with no Node imports so client components can import the types.
 *
 * Source of truth for recordings: `bob run --format stream-json`, reduced to
 * these step kinds by hand-checked conversion. See docs/lightweight-workshop-mode.md.
 */

const ANIMATION_NAMES = [
  "qubit",
  "superposition",
  "entanglement",
  "agenticLoop",
  "resultsHistogram",
  "gates",
  "parity",
  "classicalParity",
  "quantumParity",
  "amplitudeAmplification",
] as const satisfies readonly AnimationName[];

const animation = z.enum(ANIMATION_NAMES).optional();

const stepBase = { animation };

export const stepSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("prompt"), text: z.string().min(1), ...stepBase }),
  z.object({ type: z.literal("assistant"), text: z.string().min(1), ...stepBase }),
  z.object({ type: z.literal("rule"), name: z.string().min(1), ...stepBase }),
  z.object({ type: z.literal("skill"), name: z.string().min(1), ...stepBase }),
  z.object({
    type: z.literal("tool_call"),
    tool: z.string().min(1),
    input: z.string(),
    ...stepBase,
  }),
  z.object({ type: z.literal("tool_result"), text: z.string(), ...stepBase }),
  z.object({
    type: z.literal("file"),
    path: z.string().min(1),
    content: z.string(),
    ...stepBase,
  }),
  z.object({ type: z.literal("run_output"), text: z.string(), ...stepBase }),
]);

export const replaySchema = z.object({
  /** Matches the file name and the `replays.<id>` message keys. Letters, digits, underscore. */
  id: z.string().regex(/^[a-z0-9_]+$/),
  /** `recorded` = real `bob run` capture. `sample` = authored placeholder; the UI says so. */
  source: z.enum(["recorded", "sample"]),
  bobVersion: z.string().optional(),
  /** Versions or commit SHAs of the skills and MCP servers used, e.g. { "Qiskit/skills": "abc1234" }. */
  pins: z.record(z.string(), z.string()).optional(),
  recordedAt: z.string().optional(),
  /** Index of the correct predict choice (0-based). */
  predictAnswer: z.number().int().min(0).max(2),
  /** Replay id of the "what if?" variant, if any. */
  whatIf: z.string().regex(/^[a-z0-9_]+$/).optional(),
  steps: z.array(stepSchema).min(1),
});

export type ReplayStep = z.infer<typeof stepSchema>;
export type Replay = z.infer<typeof replaySchema>;

export function parseReplay(raw: unknown): Replay {
  return replaySchema.parse(raw);
}

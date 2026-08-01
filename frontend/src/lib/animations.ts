import type { ComponentType } from "react";
import { QubitAnimation } from "@/components/animations/QubitAnimation";
import { SuperpositionAnimation } from "@/components/animations/SuperpositionAnimation";
import { EntanglementAnimation } from "@/components/animations/EntanglementAnimation";

/**
 * bob4q animation registry.
 *
 * Visual explanations are **CSS/JS React components**, not rendered Manim
 * videos. The Manim scene code in `manim/scenes/*.py` is the reference spec
 * for what each animation should depict.
 *
 * Register a scene's component here once it's built. Each animation's concept
 * is validated with the user before implementation, so this map is populated
 * incrementally — an unregistered name simply renders no animation yet.
 */

export type AnimationName = "qubit" | "superposition" | "entanglement";

// Populated as each animation component is implemented and approved.
export const animations: Partial<Record<AnimationName, ComponentType>> = {
  qubit: QubitAnimation,
  superposition: SuperpositionAnimation,
  entanglement: EntanglementAnimation,
};

export function getAnimation(name: AnimationName): ComponentType | undefined {
  return animations[name];
}

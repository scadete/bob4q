/**
 * bob4q animations registry
 * Maps sceneName → video file (relative to frontend/public/videos/)
 * Update this file whenever a new Manim scene is rendered and copied.
 */

export const animations: Record<string, string> = {
  qubit: "/videos/qubit.mp4",
  superposition: "/videos/superposition.mp4",
  entanglement: "/videos/entanglement.mp4",
};

export function getAnimationUrl(sceneName: string): string | undefined {
  return animations[sceneName];
}

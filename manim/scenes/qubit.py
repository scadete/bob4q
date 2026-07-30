"""Qubit superposition introduction scene.

Render (dev):  uv run manim render scenes/qubit.py QubitScene -ql
Render (prod): uv run manim render scenes/qubit.py QubitScene -qh
Output → manim/media/videos/ → copy to frontend/public/videos/qubit.mp4
"""

from __future__ import annotations

from manim import *  # noqa: F403


class QubitScene(Scene):
    """Visualize a qubit as a Bloch sphere with superposition."""

    def construct(self) -> None:
        # TODO: build Bloch sphere animation
        title = Text("What is a Qubit?")  # noqa: F405
        self.play(Write(title))  # noqa: F405
        self.wait(2)
        self.play(FadeOut(title))  # noqa: F405

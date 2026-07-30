"""Qubit superposition introduction scene — Bloch sphere visualization.

Render (dev):  uv run manim render scenes/qubit.py QubitScene -ql
Render (prod): uv run manim render scenes/qubit.py QubitScene -qh
Output → manim/media/videos/ → copy to frontend/public/videos/qubit.mp4
"""

from __future__ import annotations

from manim import *  # noqa: F403


class QubitScene(Scene):
    """Visualize a qubit as a Bloch sphere: |0⟩ → superposition → |1⟩."""

    def construct(self) -> None:
        # ── Title ────────────────────────────────────────────────────────────
        title = Text("What is a Qubit?", font_size=48)  # noqa: F405
        subtitle = Text(  # noqa: F405
            "The quantum bit — nature's most fundamental unit of information",
            font_size=24,
            color=GRAY,  # noqa: F405
        ).next_to(title, DOWN)

        self.play(Write(title), run_time=1)  # noqa: F405
        self.play(FadeIn(subtitle, shift=UP * 0.3))  # noqa: F405
        self.wait(1)
        self.play(FadeOut(VGroup(title, subtitle)))  # noqa: F405

        # ── Bloch sphere ──────────────────────────────────────────────────────
        sphere_radius = 2.0

        # Outer sphere (wireframe look with circle cross-sections)
        sphere = Circle(radius=sphere_radius, color=BLUE_E, stroke_width=2)  # noqa: F405
        equator = Ellipse(  # noqa: F405
            width=sphere_radius * 2,
            height=sphere_radius * 0.6,
            color=BLUE_E,
            stroke_width=1,
            stroke_opacity=0.5,
        )
        axes_group = VGroup(  # noqa: F405
            Line(UP * sphere_radius * 1.3, DOWN * sphere_radius * 1.3, stroke_width=1, color=GRAY_C),  # noqa: F405
            Line(LEFT * sphere_radius * 1.3, RIGHT * sphere_radius * 1.3, stroke_width=1, color=GRAY_C),  # noqa: F405
        )

        # Pole labels
        label_zero = MathTex(r"|0\rangle", font_size=36).next_to(UP * sphere_radius, UP, buff=0.15)  # noqa: F405
        label_one = MathTex(r"|1\rangle", font_size=36).next_to(DOWN * sphere_radius, DOWN, buff=0.15)  # noqa: F405
        label_plus = MathTex(r"|{+}\rangle", font_size=28, color=YELLOW).next_to(RIGHT * sphere_radius, RIGHT, buff=0.15)  # noqa: F405

        bloch = VGroup(sphere, equator, axes_group, label_zero, label_one)  # noqa: F405

        self.play(Create(bloch), run_time=1.5)  # noqa: F405

        # ── State vector at |0⟩ ───────────────────────────────────────────────
        state_vec = Arrow(  # noqa: F405
            ORIGIN, UP * sphere_radius * 0.95,
            buff=0, color=RED, stroke_width=6,
        )
        state_label = MathTex(r"|0\rangle", font_size=32, color=RED).next_to(  # noqa: F405
            state_vec.get_tip(), RIGHT, buff=0.15
        )

        self.play(GrowArrow(state_vec), FadeIn(state_label))  # noqa: F405
        self.wait(0.8)

        # ── Narration: classical bit ──────────────────────────────────────────
        narr1 = Text("Classical bit: always 0 or 1", font_size=28).to_edge(DOWN, buff=0.6)  # noqa: F405
        self.play(Write(narr1))  # noqa: F405
        self.wait(1.2)
        self.play(FadeOut(narr1))  # noqa: F405

        # ── Rotate to superposition (equator) ────────────────────────────────
        narr2 = Text("H gate → superposition", font_size=28).to_edge(DOWN, buff=0.6)  # noqa: F405
        mid_vec = Arrow(  # noqa: F405
            ORIGIN, RIGHT * sphere_radius * 0.95,
            buff=0, color=YELLOW, stroke_width=6,
        )
        mid_label = MathTex(r"|{+}\rangle", font_size=32, color=YELLOW).next_to(  # noqa: F405
            mid_vec.get_tip(), UP, buff=0.15
        )

        self.play(Write(narr2))  # noqa: F405
        self.play(
            Transform(state_vec, mid_vec),  # noqa: F405
            Transform(state_label, mid_label),  # noqa: F405
            FadeIn(label_plus),  # noqa: F405
            run_time=1.5,
        )
        self.wait(0.5)

        # Probability bars
        bar_bg = Rectangle(width=2.5, height=0.4, color=GRAY_D, fill_opacity=0.5).shift(RIGHT * 4 + UP * 0.5)  # noqa: F405
        bar_0 = Rectangle(width=1.25, height=0.4, color=BLUE, fill_opacity=0.9).align_to(bar_bg, LEFT)  # noqa: F405
        bar_1 = Rectangle(width=1.25, height=0.4, color=RED, fill_opacity=0.9).align_to(bar_bg, RIGHT)  # noqa: F405
        lbl_50_0 = Text("50%", font_size=20, color=BLUE).next_to(bar_0, UP, buff=0.1)  # noqa: F405
        lbl_50_1 = Text("50%", font_size=20, color=RED).next_to(bar_1, UP, buff=0.1)  # noqa: F405

        self.play(FadeIn(VGroup(bar_bg, bar_0, bar_1, lbl_50_0, lbl_50_1)))  # noqa: F405
        self.wait(1)
        self.play(FadeOut(narr2))  # noqa: F405

        # ── Rotate to |1⟩ ────────────────────────────────────────────────────
        narr3 = Text("Measurement collapses to |0⟩ or |1⟩", font_size=28).to_edge(DOWN, buff=0.6)  # noqa: F405
        end_vec = Arrow(  # noqa: F405
            ORIGIN, DOWN * sphere_radius * 0.95,
            buff=0, color=RED, stroke_width=6,
        )
        end_label = MathTex(r"|1\rangle", font_size=32, color=RED).next_to(  # noqa: F405
            end_vec.get_tip(), RIGHT, buff=0.15
        )

        self.play(Write(narr3))  # noqa: F405
        self.play(
            Transform(state_vec, end_vec),  # noqa: F405
            Transform(state_label, end_label),  # noqa: F405
            FadeOut(VGroup(bar_bg, bar_0, bar_1, lbl_50_0, lbl_50_1, label_plus)),  # noqa: F405
            run_time=1.5,
        )
        self.wait(1)
        self.play(FadeOut(Group(*self.mobjects)))  # noqa: F405
        self.wait(0.3)

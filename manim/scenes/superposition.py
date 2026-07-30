"""Superposition scene — coin analogy to H gate.

Render (dev):  uv run manim render scenes/superposition.py SuperpositionScene -ql
Render (prod): uv run manim render scenes/superposition.py SuperpositionScene -qh
Output → manim/media/videos/ → copy to frontend/public/videos/superposition.mp4
"""

from __future__ import annotations

from manim import *  # noqa: F403


class SuperpositionScene(Scene):
    """Coin analogy → probability amplitudes → H gate on Bloch sphere."""

    def construct(self) -> None:
        # ── Title ─────────────────────────────────────────────────────────────
        title = Text("Superposition", font_size=48)  # noqa: F405
        self.play(Write(title))  # noqa: F405
        self.wait(0.8)
        self.play(FadeOut(title))  # noqa: F405

        # ── Classical coin analogy ────────────────────────────────────────────
        coin = Circle(radius=1.2, fill_color=GOLD_D, fill_opacity=1, color=GOLD_E, stroke_width=4)  # noqa: F405
        heads = Text("H", font_size=48, color=WHITE, weight=BOLD).move_to(coin)  # noqa: F405
        coin_group = VGroup(coin, heads).shift(LEFT * 3)  # noqa: F405

        narr1 = Text("A coin in flight is in superposition", font_size=28).to_edge(DOWN, buff=0.6)  # noqa: F405

        self.play(FadeIn(coin_group))  # noqa: F405
        self.play(Write(narr1))  # noqa: F405

        # Spin animation (rotate coin)
        self.play(
            Rotate(coin_group, angle=TAU, axis=UP, run_time=1.5),  # noqa: F405
        )
        self.wait(0.5)

        # Show probability split
        arrow_h = Arrow(coin_group.get_right(), RIGHT * 0.5, buff=0.1, color=BLUE)  # noqa: F405
        arrow_t = Arrow(coin_group.get_right(), RIGHT * 0.5 + DOWN * 1.5, buff=0.1, color=RED)  # noqa: F405
        p_h = MathTex(r"P(\text{Heads}) = 50\%", font_size=28, color=BLUE).next_to(arrow_h, RIGHT, buff=0.2)  # noqa: F405
        p_t = MathTex(r"P(\text{Tails}) = 50\%", font_size=28, color=RED).next_to(arrow_t, RIGHT, buff=0.2)  # noqa: F405

        self.play(GrowArrow(arrow_h), GrowArrow(arrow_t), FadeIn(p_h), FadeIn(p_t))  # noqa: F405
        self.wait(1.2)
        self.play(FadeOut(VGroup(coin_group, arrow_h, arrow_t, p_h, p_t, narr1)))  # noqa: F405

        # ── Quantum amplitude ─────────────────────────────────────────────────
        narr2 = Text("Qubit: probability amplitudes, not just probabilities", font_size=24).to_edge(DOWN, buff=0.6)  # noqa: F405

        state_eq = MathTex(  # noqa: F405
            r"|\psi\rangle = \alpha|0\rangle + \beta|1\rangle",
            font_size=48,
        )
        constraint = MathTex(  # noqa: F405
            r"|\alpha|^2 + |\beta|^2 = 1",
            font_size=36,
            color=GRAY,  # noqa: F405
        ).next_to(state_eq, DOWN, buff=0.4)

        self.play(Write(narr2))  # noqa: F405
        self.play(Write(state_eq))  # noqa: F405
        self.play(FadeIn(constraint, shift=UP * 0.2))  # noqa: F405
        self.wait(1.5)

        # Equal superposition
        equal_super = MathTex(  # noqa: F405
            r"|{+}\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle",
            font_size=40,
            color=YELLOW,  # noqa: F405
        )
        self.play(Transform(state_eq, equal_super), FadeOut(constraint))  # noqa: F405
        self.wait(1.5)
        self.play(FadeOut(VGroup(state_eq, narr2)))  # noqa: F405

        # ── H gate ────────────────────────────────────────────────────────────
        narr3 = Text("Hadamard (H) gate creates equal superposition", font_size=26).to_edge(DOWN, buff=0.6)  # noqa: F405

        # Circuit diagram (simple boxes)
        wire = Line(LEFT * 3, RIGHT * 3, color=WHITE)  # noqa: F405
        h_box = Square(side_length=0.8, color=BLUE, fill_color=BLUE_E, fill_opacity=0.8)  # noqa: F405
        h_label = Text("H", font_size=32, color=WHITE, weight=BOLD).move_to(h_box)  # noqa: F405
        ket0 = MathTex(r"|0\rangle", font_size=32).next_to(wire, LEFT, buff=0.1)  # noqa: F405
        ket_plus = MathTex(r"|{+}\rangle", font_size=32, color=YELLOW).next_to(wire, RIGHT, buff=0.1)  # noqa: F405
        circuit = VGroup(wire, h_box, h_label, ket0, ket_plus)  # noqa: F405

        self.play(Write(narr3))  # noqa: F405
        self.play(Create(circuit), run_time=1.5)  # noqa: F405
        self.wait(1.5)
        self.play(FadeOut(Group(*self.mobjects)))  # noqa: F405
        self.wait(0.3)

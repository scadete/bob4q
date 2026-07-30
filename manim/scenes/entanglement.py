"""Entanglement / Bell state scene.

Render (dev):  uv run manim render scenes/entanglement.py EntanglementScene -ql
Render (prod): uv run manim render scenes/entanglement.py EntanglementScene -qh
Output → manim/media/videos/ → copy to frontend/public/videos/entanglement.mp4
"""

from __future__ import annotations

from manim import *  # noqa: F403


class EntanglementScene(Scene):
    """Two qubits → CNOT gate → Bell state → correlated measurement."""

    def construct(self) -> None:
        # ── Title ─────────────────────────────────────────────────────────────
        title = Text("Quantum Entanglement", font_size=48)  # noqa: F405
        subtitle = Text("Spooky action at a distance — Einstein (1935)", font_size=24, color=GRAY).next_to(title, DOWN)  # noqa: F405
        self.play(Write(title), FadeIn(subtitle, shift=UP * 0.2))  # noqa: F405
        self.wait(1.5)
        self.play(FadeOut(VGroup(title, subtitle)))  # noqa: F405

        # ── Two-qubit circuit ─────────────────────────────────────────────────
        # Wires
        wire1 = Line(LEFT * 3.5, RIGHT * 3.5, color=WHITE).shift(UP * 0.8)  # noqa: F405
        wire2 = Line(LEFT * 3.5, RIGHT * 3.5, color=WHITE).shift(DOWN * 0.8)  # noqa: F405

        # Initial state labels
        q0_in = MathTex(r"|0\rangle", font_size=32).next_to(wire1, LEFT, buff=0.1)  # noqa: F405
        q1_in = MathTex(r"|0\rangle", font_size=32).next_to(wire2, LEFT, buff=0.1)  # noqa: F405

        # H gate on qubit 0
        h_box = Square(side_length=0.7, color=BLUE, fill_color=BLUE_E, fill_opacity=0.8).move_to(  # noqa: F405
            wire1.get_center() + LEFT * 1.5
        )
        h_label = Text("H", font_size=28, color=WHITE, weight=BOLD).move_to(h_box)  # noqa: F405

        # CNOT gate
        cnot_center = wire1.get_center() + RIGHT * 0.5  # noqa: F405
        cnot_control = Dot(cnot_center, radius=0.12, color=BLUE)  # noqa: F405
        cnot_line = DashedLine(  # noqa: F405
            cnot_center, cnot_center + DOWN * 1.6, color=BLUE, stroke_width=2
        )
        cnot_target_center = cnot_center + DOWN * 1.6
        cnot_target = Circle(radius=0.3, color=BLUE, stroke_width=3).move_to(cnot_target_center)  # noqa: F405
        cnot_plus = Text("+", font_size=32, color=BLUE, weight=BOLD).move_to(cnot_target_center)  # noqa: F405

        # Output state
        bell_out = MathTex(  # noqa: F405
            r"|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}",
            font_size=28,
            color=YELLOW,  # noqa: F405
        ).next_to(wire1, RIGHT, buff=0.8).shift(DOWN * 0.4)

        circuit = VGroup(wire1, wire2, q0_in, q1_in, h_box, h_label,  # noqa: F405
                         cnot_control, cnot_line, cnot_target, cnot_plus)

        self.play(Create(VGroup(wire1, wire2, q0_in, q1_in)), run_time=1)  # noqa: F405
        self.play(FadeIn(VGroup(h_box, h_label)))  # noqa: F405

        narr1 = Text("H gate on qubit 0 → superposition", font_size=24).to_edge(DOWN, buff=0.6)  # noqa: F405
        self.play(Write(narr1))  # noqa: F405
        self.wait(0.8)

        narr2 = Text("CNOT with qubit 0 as control, qubit 1 as target", font_size=24).to_edge(DOWN, buff=0.6)  # noqa: F405
        self.play(
            Transform(narr1, narr2),  # noqa: F405
            FadeIn(VGroup(cnot_control, cnot_line, cnot_target, cnot_plus)),  # noqa: F405
        )
        self.wait(0.8)

        narr3 = Text("Result: Bell state — maximally entangled", font_size=24).to_edge(DOWN, buff=0.6)  # noqa: F405
        self.play(
            Transform(narr1, narr3),  # noqa: F405
            Write(bell_out),  # noqa: F405
        )
        self.wait(1.5)
        self.play(FadeOut(Group(*self.mobjects)))  # noqa: F405

        # ── Correlated measurement ────────────────────────────────────────────
        qubit_a = Circle(radius=0.6, color=BLUE, fill_color=BLUE_D, fill_opacity=0.8).shift(LEFT * 3.5)  # noqa: F405
        qubit_b = Circle(radius=0.6, color=RED, fill_color=RED_D, fill_opacity=0.8).shift(RIGHT * 3.5)  # noqa: F405
        label_a = Text("A", font_size=28, color=WHITE, weight=BOLD).move_to(qubit_a)  # noqa: F405
        label_b = Text("B", font_size=28, color=WHITE, weight=BOLD).move_to(qubit_b)  # noqa: F405

        link = DashedLine(qubit_a.get_right(), qubit_b.get_left(), color=YELLOW, stroke_width=2)  # noqa: F405
        link_label = MathTex(r"|\Phi^+\rangle", font_size=28, color=YELLOW).next_to(link, UP, buff=0.15)  # noqa: F405

        narr4 = Text("Measure A → instantly know B", font_size=26).to_edge(DOWN, buff=0.6)  # noqa: F405

        self.play(FadeIn(VGroup(qubit_a, label_a, qubit_b, label_b, link, link_label)))  # noqa: F405
        self.play(Write(narr4))  # noqa: F405
        self.wait(0.8)

        # Measurement flash
        result_a = Text("0", font_size=48, color=BLUE, weight=BOLD).next_to(qubit_a, UP, buff=0.3)  # noqa: F405
        result_b = Text("0", font_size=48, color=RED, weight=BOLD).next_to(qubit_b, UP, buff=0.3)  # noqa: F405

        self.play(Flash(qubit_a, color=BLUE, line_length=0.3), FadeIn(result_a))  # noqa: F405
        self.play(Flash(qubit_b, color=RED, line_length=0.3), FadeIn(result_b))  # noqa: F405
        self.wait(1)

        corr = Text("Always correlated — never random independently", font_size=22, color=YELLOW).to_edge(DOWN, buff=0.6)  # noqa: F405
        self.play(Transform(narr4, corr))  # noqa: F405
        self.wait(1.5)
        self.play(FadeOut(Group(*self.mobjects)))  # noqa: F405
        self.wait(0.3)

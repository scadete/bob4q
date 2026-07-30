"""
notebooks/lib/visuals.py
Helper utilities for the workshop notebooks (run locally in Jupyter).

Usage:
    from lib.visuals import draw_circuit, plot_counts

All functions work with matplotlib inline output inside Jupyter.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from qiskit import QuantumCircuit


def draw_circuit(qc: "QuantumCircuit", title: str | None = None) -> None:
    """Draw a Qiskit circuit with an optional title.

    Uses the ``mpl`` output style; falls back to ``text`` if matplotlib is
    not available.

    Args:
        qc: The circuit to draw.
        title: Optional title printed above the circuit diagram.
    """
    import matplotlib.pyplot as plt  # type: ignore[import]

    if title:
        print(title)
    try:
        fig = qc.draw(output="mpl")
        plt.show()
        return fig
    except Exception:
        print(qc.draw(output="text"))


def plot_counts(
    counts: dict[str, int],
    title: str = "Measurement results",
    figsize: tuple[int, int] = (7, 4),
) -> None:
    """Plot a histogram of measurement counts.

    Args:
        counts: Dict mapping bitstring outcomes to occurrence counts.
        title: Chart title.
        figsize: Matplotlib figure size (width, height) in inches.
    """
    import matplotlib.pyplot as plt  # type: ignore[import]

    if not counts:
        print("(no counts to display)")
        return

    labels = sorted(counts.keys())
    values = [counts[k] for k in labels]
    total = sum(values)
    percentages = [v / total * 100 for v in values]

    fig, ax = plt.subplots(figsize=figsize)
    bars = ax.bar(labels, values, color="#0062ff", edgecolor="#001d6c", linewidth=0.8)

    # Annotate each bar with count and percentage
    for bar, pct in zip(bars, percentages):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + total * 0.01,
            f"{pct:.1f}%",
            ha="center",
            va="bottom",
            fontsize=9,
        )

    ax.set_title(title, pad=12)
    ax.set_xlabel("Bitstring")
    ax.set_ylabel("Counts")
    ax.set_ylim(0, max(values) * 1.18)
    ax.spines[["top", "right"]].set_visible(False)
    plt.tight_layout()
    plt.show()


def run_and_plot(
    qc: "QuantumCircuit",
    shots: int = 1024,
    title: str = "Measurement results",
) -> dict[str, int]:
    """Run *qc* with ``StatevectorSampler`` and plot the results.

    Convenience wrapper that combines execution + plotting into one call.
    Ideal for workshop cells where brevity matters.

    Args:
        qc: The circuit to run (must include measurements).
        shots: Number of shots for the sampler.
        title: Chart title passed to :func:`plot_counts`.

    Returns:
        The raw counts dict.
    """
    from qiskit.primitives import StatevectorSampler  # type: ignore[import]

    sampler = StatevectorSampler()
    job = sampler.run([(qc, None, shots)])
    result = job.result()

    # StatevectorSampler stores counts in the first classical register
    pub_result = result[0]
    # Try each classical register until we find counts
    counts: dict[str, int] = {}
    for reg_name in pub_result.data.__dict__:
        try:
            counts = dict(getattr(pub_result.data, reg_name).get_counts())
            break
        except Exception:
            continue

    if not counts:
        print("Warning: could not extract counts from result.")
        return {}

    plot_counts(counts, title=title)
    return counts

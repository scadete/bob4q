"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Grid, Column, Tile, Button, Tag } from "@carbon/react";
import { Copy, Checkmark, ArrowRight, Launch } from "@carbon/icons-react";

export interface WalkthroughNotebookItem {
  slug: string;
  title: string;
  description: string;
  repoPath: string;
}

interface WalkthroughViewProps {
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    badgeBeginner: string;
    badgeUnique: string;
    promptLabel: string;
    copyPrompt: string;
    copied: string;
    overviewTitle: string;
    overviewDesc: string;
    navOverview: string;
    navIdea: string;
    navStandards: string;
    navFlow: string;
    navGuardrails: string;
    navSimVsQpu: string;
    navBobalytics: string;
    navNotebooks: string;
    cap1Title: string;
    cap1Challenge: string;
    cap1Prompt: string;
    cap1Explanation: string;
    cap1ValTrad: string;
    cap1ValBob: string;
    cap2Title: string;
    cap2Challenge: string;
    cap2Prompt: string;
    cap2Explanation: string;
    cap2ValTrad: string;
    cap2ValBob: string;
    cap3Title: string;
    cap3Challenge: string;
    cap3Prompt: string;
    cap3Explanation: string;
    cap3ValTrad: string;
    cap3ValBob: string;
    cap4Title: string;
    cap4Challenge: string;
    cap4Prompt: string;
    cap4Explanation: string;
    cap4ValTrad: string;
    cap4ValBob: string;
    cap5Title: string;
    cap5Challenge: string;
    cap5Prompt: string;
    cap5Explanation: string;
    cap5ValTrad: string;
    cap5ValBob: string;
    cap6Title: string;
    cap6Desc: string;
    statExp: string;
    statCircuits: string;
    statErrors: string;
    statVersion: string;
    notebooksHeading: string;
    notebooksSubheading: string;
    startNotebook1: string;
    tryInNotebook: string;
  };
  notebooks: WalkthroughNotebookItem[];
}

export function WalkthroughView({ locale, labels, notebooks }: WalkthroughViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const notebookTitleBySlug = (slug: string): string =>
    notebooks.find((n) => n.slug === slug)?.title ?? slug;

  const capabilities = [
    {
      id: "cap-idea",
      navLabel: labels.navIdea,
      num: 1,
      title: labels.cap1Title,
      challenge: labels.cap1Challenge,
      prompt: labels.cap1Prompt,
      notebookSlug: "01-hello-quantum-with-bob",
      codeResponse: `from qiskit import QuantumCircuit

# 1 qubit (the coin) and 1 classical bit (to record the flip)
qc = QuantumCircuit(1, 1)

# Hadamard gate: spins the coin into a 50/50 superposition!
qc.h(0)

# Measure: catches the coin and records either 0 or 1
qc.measure(0, 0)`,
      explanation: labels.cap1Explanation,
      valTrad: labels.cap1ValTrad,
      valBob: labels.cap1ValBob,
    },
    {
      id: "cap-standards",
      navLabel: labels.navStandards,
      num: 2,
      title: labels.cap2Title,
      challenge: labels.cap2Challenge,
      prompt: labels.cap2Prompt,
      notebookSlug: "03-modern-qiskit-guardrails",
      codeResponse: `# Current Qiskit 2.x standard (no deprecated execute() or old Aer)
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

# Clean modern execution with Primitives V2:
sampler = StatevectorSampler()
job = sampler.run([(qc, None, 1024)])
counts = dict(job.result()[0].data.c.get_counts())`,
      explanation: labels.cap2Explanation,
      valTrad: labels.cap2ValTrad,
      valBob: labels.cap2ValBob,
    },
    {
      id: "cap-flow",
      navLabel: labels.navFlow,
      num: 3,
      title: labels.cap3Title,
      challenge: labels.cap3Challenge,
      prompt: labels.cap3Prompt,
      notebookSlug: "02-entanglement-magic-coins",
      codeResponse: `# Step 1: Create the circuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

# Step 2: Run in-process with workshop helper
from lib.visuals import run_and_plot
counts = run_and_plot(qc, title="Entangled Bell State")
# Output: only '00' and '11' are observed!`,
      explanation: labels.cap3Explanation,
      valTrad: labels.cap3ValTrad,
      valBob: labels.cap3ValBob,
    },
    {
      id: "cap-guardrails",
      navLabel: labels.navGuardrails,
      num: 4,
      title: labels.cap4Title,
      challenge: labels.cap4Challenge,
      prompt: labels.cap4Prompt,
      notebookSlug: "03-modern-qiskit-guardrails",
      codeResponse: `# Before: Missing measurement
unmeasured_qc = QuantumCircuit(2)
unmeasured_qc.h(0)
unmeasured_qc.cx(0, 1)

# Bob's Automatic Guardrail Fix:
# "Adding measurement gates so the computer can read the outcome:"
unmeasured_qc.measure_all()
# Result: 2 classical bits added, circuit is safe to run!`,
      explanation: labels.cap4Explanation,
      valTrad: labels.cap4ValTrad,
      valBob: labels.cap4ValBob,
    },
    {
      id: "cap-sim-vs-qpu",
      navLabel: labels.navSimVsQpu,
      num: 5,
      title: labels.cap5Title,
      challenge: labels.cap5Challenge,
      prompt: labels.cap5Prompt,
      notebookSlug: "04-simulator-vs-real-qpu",
      codeResponse: `# 1. Local Flight Simulator (Fast, free, zero wait):
from lib.backend import run_circuit
counts = run_circuit(qc, shots=1024)

# 2. Real IBM Quantum Rocket (Cryogenic QPU via Runtime):
# from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
# service = QiskitRuntimeService(token=os.getenv("IBMQ_API_TOKEN"))
# sampler = SamplerV2(mode=service.backend("ibm_sherbrooke"))
# job = sampler.run([qc])`,
      explanation: labels.cap5Explanation,
      valTrad: labels.cap5ValTrad,
      valBob: labels.cap5ValBob,
    },
  ];

  return (
    <div style={{ padding: "2rem 0" }}>
      {/* Hero Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f62fe 0%, #002d9c 100%)",
          color: "#ffffff",
          padding: "3.5rem 2rem",
          borderRadius: "4px",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <Tag type="cyan">{labels.badgeBeginner}</Tag>
            <Tag type="green">{labels.badgeUnique}</Tag>
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 400,
              lineHeight: 1.2,
              marginBottom: "1rem",
              color: "#ffffff",
            }}
          >
            {labels.title}
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              opacity: 0.9,
              maxWidth: "700px",
              lineHeight: 1.5,
              marginBottom: "1.5rem",
            }}
          >
            {labels.subtitle}
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Button
              as={Link}
              href={`/${locale}/lab/01-hello-quantum-with-bob`}
              kind="primary"
              renderIcon={ArrowRight}
            >
              {labels.startNotebook1}
            </Button>
            <Button
              href="#notebooks"
              kind="tertiary"
              renderIcon={ArrowRight}
              style={{ color: "#ffffff", borderColor: "#ffffff" }}
            >
              {labels.navNotebooks}
            </Button>
          </div>
        </div>
      </section>

      <Grid style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Sticky Sidebar Navigation */}
        <Column sm={4} md={2} lg={4}>
          <div
            style={{
              position: "sticky",
              top: "2rem",
              background: "var(--cds-layer-01, #262626)",
              padding: "1.5rem",
              borderRadius: "4px",
              border: "1px solid var(--cds-border-subtle, #393939)",
              marginBottom: "2rem",
            }}
          >
            <h4
              style={{
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--cds-text-secondary, #c6c6c6)",
                marginBottom: "1rem",
              }}
            >
              Capabilities
            </h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <a
                href="#overview"
                style={{
                  color: "var(--cds-link-primary, #78a9ff)",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  padding: "0.35rem 0",
                }}
              >
                {labels.navOverview}
              </a>
              {capabilities.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  style={{
                    color: "var(--cds-text-primary, #f4f4f4)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    padding: "0.35rem 0",
                  }}
                >
                  {c.navLabel}
                </a>
              ))}
              <a
                href="#bobalytics"
                style={{
                  color: "var(--cds-text-primary, #f4f4f4)",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  padding: "0.35rem 0",
                }}
              >
                {labels.navBobalytics}
              </a>
              <a
                href="#notebooks"
                style={{
                  color: "var(--cds-link-primary, #78a9ff)",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  padding: "0.35rem 0",
                  marginTop: "0.5rem",
                  borderTop: "1px solid var(--cds-border-subtle, #393939)",
                  paddingTop: "0.75rem",
                }}
              >
                {labels.navNotebooks} →
              </a>
            </nav>
          </div>
        </Column>

        {/* Walkthrough Content */}
        <Column sm={4} md={6} lg={12}>
          {/* Overview Section */}
          <section id="overview" style={{ marginBottom: "3rem" }}>
            <Tile
              style={{
                padding: "2rem",
                borderLeft: "4px solid var(--cds-support-info, #4589ff)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  marginBottom: "0.75rem",
                  color: "var(--cds-text-primary)",
                }}
              >
                {labels.overviewTitle}
              </h2>
              <p
                style={{
                  fontSize: "1.0625rem",
                  color: "var(--cds-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {labels.overviewDesc}
              </p>
            </Tile>
          </section>

          {/* Capabilities 1 to 5 */}
          {capabilities.map((cap, idx) => (
            <section
              key={cap.id}
              id={cap.id}
              style={{
                marginBottom: "3.5rem",
                scrollMarginTop: "2rem",
              }}
            >
              <div
                style={{
                  background: "var(--cds-layer-01, #262626)",
                  border: "1px solid var(--cds-border-subtle, #393939)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "1.5rem 2rem",
                    borderBottom: "1px solid var(--cds-border-subtle, #393939)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#0f62fe",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                      }}
                    >
                      {cap.num}
                    </span>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "var(--cds-text-primary)",
                        margin: 0,
                      }}
                    >
                      {cap.title}
                    </h3>
                  </div>
                  <Tag type="blue">Capability {cap.num}</Tag>
                </div>

                <div style={{ padding: "2rem" }}>
                  {/* Challenge */}
                  <div
                    style={{
                      background: "rgba(255, 131, 43, 0.08)",
                      borderLeft: "3px solid #ff832b",
                      padding: "1rem 1.25rem",
                      borderRadius: "2px",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <strong style={{ display: "block", color: "#ff832b", marginBottom: "0.25rem" }}>
                      The Challenge:
                    </strong>
                    <p style={{ margin: 0, color: "var(--cds-text-secondary)", fontSize: "0.9375rem" }}>
                      {cap.challenge}
                    </p>
                  </div>

                  {/* Prompt Box */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "var(--cds-layer-02, #393939)",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px 4px 0 0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--cds-text-secondary)",
                        }}
                      >
                        {labels.promptLabel}
                      </span>
                      <Button
                        kind="ghost"
                        size="sm"
                        onClick={() => handleCopy(cap.prompt, idx)}
                        renderIcon={copiedIndex === idx ? Checkmark : Copy}
                      >
                        {copiedIndex === idx ? labels.copied : labels.copyPrompt}
                      </Button>
                    </div>
                    <div
                      style={{
                        background: "var(--cds-background, #161616)",
                        padding: "1rem 1.25rem",
                        borderRadius: "0 0 4px 4px",
                        border: "1px solid var(--cds-layer-02, #393939)",
                        borderTop: "none",
                        fontStyle: "italic",
                        color: "var(--cds-text-primary)",
                        fontSize: "0.9375rem",
                      }}
                    >
                      &ldquo;{cap.prompt}&rdquo;
                    </div>
                  </div>

                  {/* Bob's Code Response */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--cds-text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Bob&apos;s Solution (Qiskit 2.x):
                    </div>
                    <pre
                      style={{
                        background: "#0c0c0c",
                        color: "#a7f3d0",
                        padding: "1.25rem",
                        borderRadius: "4px",
                        overflowX: "auto",
                        fontSize: "0.875rem",
                        fontFamily: "var(--cds-font-mono, monospace)",
                        border: "1px solid #262626",
                        margin: 0,
                      }}
                    >
                      <code>{cap.codeResponse}</code>
                    </pre>
                  </div>

                  {/* Explanation */}
                  <p
                    style={{
                      color: "var(--cds-text-secondary)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.5,
                      marginBottom: "1.5rem",
                    }}
                  >
                    {cap.explanation}
                  </p>

                  {/* Value Comparison */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "1rem",
                      background: "var(--cds-layer-02, #333333)",
                      padding: "1rem 1.25rem",
                      borderRadius: "4px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--cds-support-error, #ff8389)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Traditional:
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
                        {cap.valTrad}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--cds-support-success, #42be65)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        With IBM Bob:
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "var(--cds-text-primary)" }}>
                        {cap.valBob}
                      </span>
                    </div>
                  </div>

                  {/* Direct link to corresponding Notebook */}
                  <div
                    style={{
                      marginTop: "1.25rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--cds-border-subtle)",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Link
                      href={`/${locale}/lab/${cap.notebookSlug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--cds-link-primary)",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      <span>
                        {labels.tryInNotebook}: {notebookTitleBySlug(cap.notebookSlug)}
                      </span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Capability 6: Bobalytics Dashboard */}
          <section id="bobalytics" style={{ marginBottom: "4rem", scrollMarginTop: "2rem" }}>
            <div
              style={{
                background: "var(--cds-layer-01, #262626)",
                border: "1px solid var(--cds-border-subtle, #393939)",
                borderRadius: "4px",
                padding: "2rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#0f62fe",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  6
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0, color: "var(--cds-text-primary)" }}>
                  {labels.cap6Title}
                </h3>
              </div>
              <p style={{ color: "var(--cds-text-secondary)", marginBottom: "1.5rem" }}>
                {labels.cap6Desc}
              </p>

              {/* Metrics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {[
                  { value: "0", label: labels.statExp, color: "#0f62fe" },
                  { value: "5", label: labels.statCircuits, color: "#24a148" },
                  { value: "0%", label: labels.statErrors, color: "#8a3ffc" },
                  { value: "2.x", label: labels.statVersion, color: "#0072c3" },
                ].map((stat, i) => (
                  <Tile
                    key={i}
                    style={{
                      padding: "1.5rem",
                      background: "var(--cds-layer-02, #333333)",
                      borderTop: `3px solid ${stat.color}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--cds-text-primary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
                      {stat.label}
                    </div>
                  </Tile>
                ))}
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--cds-border-subtle)",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Link
                  href={`/${locale}/lab/05-bobalytics-and-capstone`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--cds-link-primary)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  <span>
                    {labels.tryInNotebook}: {notebookTitleBySlug("05-bobalytics-and-capstone")}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          {/* Hands-on Notebooks Section */}
          <section id="notebooks" style={{ marginBottom: "4rem", scrollMarginTop: "2rem" }}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 400,
                color: "var(--cds-text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              {labels.notebooksHeading}
            </h2>
            <p style={{ color: "var(--cds-text-secondary)", marginBottom: "2rem" }}>
              {labels.notebooksSubheading}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {notebooks.map((nb, idx) => (
                <Link
                  key={nb.slug}
                  href={`/${locale}/lab/${nb.slug}`}
                  style={{
                    display: "block",
                    padding: "1.5rem",
                    background: "var(--cds-layer-01, #262626)",
                    borderLeft: "4px solid var(--cds-border-interactive, #4589ff)",
                    borderRadius: "2px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform 0.15s ease, background 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "var(--cds-background-brand)",
                            color: "var(--cds-text-on-color)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            color: "var(--cds-text-primary)",
                          }}
                        >
                          {nb.title}
                        </span>
                      </div>
                      <span
                        style={{
                          display: "block",
                          margin: "0.5rem 0 0.75rem",
                          color: "var(--cds-text-secondary)",
                          fontSize: "0.9375rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {nb.description}
                      </span>
                      <code
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--cds-text-helper, #8d8d8d)",
                          background: "#161616",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "2px",
                        }}
                      >
                        {nb.repoPath}
                      </code>
                    </div>
                    <Launch style={{ color: "var(--cds-icon-primary)", marginTop: "0.25rem" }} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Column>
      </Grid>
    </div>
  );
}

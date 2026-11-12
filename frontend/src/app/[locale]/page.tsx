"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button, Grid, Column, Tile } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MAIN_REPLAY_IDS } from "@/lib/replay-ids";
import styles from "./page.module.css";

const HOME_NOTEBOOK_SLUGS = [
  "01-hello-quantum-with-bob",
  "02-entanglement-magic-coins",
  "03-modern-qiskit-guardrails",
  "04-simulator-vs-real-qpu",
  "05-bobalytics-and-capstone",
] as const;

export default function HomePage() {
  const t = useTranslations("home");
  const tnb = useTranslations("notebooks");
  const trep = useTranslations("replays");
  const locale = useLocale();

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          padding: "2rem 0 4rem",
          background: "var(--cds-background)",
          borderBottom: "1px solid var(--cds-border-subtle)",
        }}
      >
        <Grid>
          <Column
            sm={4}
            md={8}
            lg={16}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "2rem",
            }}
          >
            <LocaleSwitcher />
          </Column>
          <Column sm={4} md={8} lg={12}>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 300,
                marginBottom: "1rem",
                color: "var(--cds-text-primary)",
              }}
            >
              {t("hero_title")}
            </h1>
            <p
              style={{
                fontSize: "clamp(1.0625rem, 2.5vw, 1.25rem)",
                color: "var(--cds-text-secondary)",
                marginBottom: "2rem",
                maxWidth: "36rem",
              }}
            >
              {t("hero_tagline")}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Button
                as={Link}
                href={`/${locale}/replay`}
                renderIcon={ArrowRight}
                size="lg"
              >
                {t("cta_replays")}
              </Button>
              <Button
                as={Link}
                href={`/${locale}/lab/01-hello-quantum-with-bob`}
                kind="secondary"
                renderIcon={ArrowRight}
                size="lg"
              >
                {t("cta_notebooks")}
              </Button>
              <Button
                as={Link}
                href={`/${locale}/lab`}
                kind="tertiary"
                renderIcon={ArrowRight}
                size="lg"
              >
                {t("cta_lab")}
              </Button>
              <Button
                as={Link}
                href={`/${locale}/demo`}
                kind="tertiary"
                renderIcon={ArrowRight}
                size="lg"
              >
                {t("cta_demo")}
              </Button>
            </div>
          </Column>
        </Grid>
      </section>

      {/* Recorded Bob sessions */}
      <section style={{ padding: "3rem 0", borderBottom: "1px solid var(--cds-border-subtle)" }}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 400,
                marginBottom: "0.5rem",
                color: "var(--cds-text-primary)",
              }}
            >
              {t("replays_title")}
            </h2>
            <p
              style={{
                color: "var(--cds-text-secondary)",
                marginBottom: "2rem",
                fontSize: "1rem",
                lineHeight: 1.5,
              }}
            >
              {t("replays_subtitle")}
            </p>
          </Column>
          <Column sm={4} md={8} lg={16}>
            <div className={styles.cards}>
              {MAIN_REPLAY_IDS.map((id, index) => (
                <Link
                  key={id}
                  href={`/${locale}/replay/${id}`}
                  style={{
                    display: "block",
                    height: "100%",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Tile
                    style={{
                      height: "100%",
                      padding: "1.5rem",
                      borderLeft: "4px solid var(--cds-border-interactive)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        margin: 0,
                        color: "var(--cds-text-primary)",
                      }}
                    >
                      {index + 1}. {trep(`${id}.title`)}
                    </h3>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--cds-link-primary)",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      <span>{t("open_replay")}</span>
                      <ArrowRight size={16} />
                    </div>
                  </Tile>
                </Link>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      {/* Notebooks (1 through 5) */}
      <section style={{ padding: "3rem 0" }}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 400,
                marginBottom: "0.5rem",
                color: "var(--cds-text-primary)",
              }}
            >
              {t("modules_title")}
            </h2>
            <p
              style={{
                color: "var(--cds-text-secondary)",
                marginBottom: "2rem",
                fontSize: "1rem",
                lineHeight: 1.5,
              }}
            >
              {t("modules_subtitle")}
            </p>
          </Column>
          <Column sm={4} md={8} lg={16}>
            <div className={styles.cards}>
              {HOME_NOTEBOOK_SLUGS.map((slug, index) => (
                <Link
                  key={slug}
                  href={`/${locale}/lab/${slug}`}
                  style={{
                    display: "block",
                    height: "100%",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Tile
                    style={{
                      height: "100%",
                      padding: "1.5rem",
                      borderLeft: "4px solid var(--cds-border-interactive)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "1.75rem",
                            height: "1.75rem",
                            borderRadius: "50%",
                            background: "var(--cds-background-brand)",
                            color: "var(--cds-text-on-color)",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </span>
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            margin: 0,
                            color: "var(--cds-text-primary)",
                          }}
                        >
                          {tnb(`${slug}.title`)}
                        </h3>
                      </div>
                      <p
                        style={{
                          color: "var(--cds-text-secondary)",
                          lineHeight: 1.6,
                          margin: 0,
                          fontSize: "0.9375rem",
                        }}
                      >
                        {tnb(`${slug}.description`)}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--cds-link-primary)",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      <span>{t("open_notebook")}</span>
                      <ArrowRight size={16} />
                    </div>
                  </Tile>
                </Link>
              ))}
            </div>
          </Column>
        </Grid>
      </section>

      {/* Prerequisites */}
      <section
        style={{
          padding: "3rem 0",
          background: "var(--cds-layer-01)",
          borderTop: "1px solid var(--cds-border-subtle)",
        }}
      >
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 400,
                marginBottom: "1.5rem",
                color: "var(--cds-text-primary)",
              }}
            >
              {t("prereqs_title")}
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {(["prereq_node", "prereq_python", "prereq_ollama", "prereq_podman"] as const).map(
                (key) => (
                  <li
                    key={key}
                    style={{
                      color: "var(--cds-text-secondary)",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: "var(--cds-support-success)" }}>✓</span>
                    {t(key)}
                  </li>
                ),
              )}
            </ul>
          </Column>
        </Grid>
      </section>
    </main>
  );
}

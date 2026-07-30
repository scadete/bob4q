"use client";

import { useTranslations } from "next-intl";
import { Button, Grid, Column, Tile } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations("home");
  const tn = useTranslations("nav");

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          padding: "4rem 2rem",
          background: "var(--cds-background)",
          borderBottom: "1px solid var(--cds-border-subtle)",
        }}
      >
        <Grid>
          <Column sm={4} md={6} lg={8}>
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
                fontSize: "1.25rem",
                color: "var(--cds-text-secondary)",
                marginBottom: "2rem",
                maxWidth: "480px",
              }}
            >
              {t("hero_tagline")}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Button as={Link} href="/lab" renderIcon={ArrowRight} size="lg">
                {t("cta_lab")}
              </Button>
              <Button
                as={Link}
                href="/demo"
                kind="secondary"
                renderIcon={ArrowRight}
                size="lg"
              >
                {t("cta_demo")}
              </Button>
            </div>
          </Column>
        </Grid>
      </section>

      {/* Modules */}
      <section style={{ padding: "3rem 2rem" }}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 400,
                marginBottom: "2rem",
                color: "var(--cds-text-primary)",
              }}
            >
              {t("modules_title")}
            </h2>
          </Column>
          {(
            [
              ["module_1_title", "module_1_body"],
              ["module_2_title", "module_2_body"],
              ["module_3_title", "module_3_body"],
            ] as const
          ).map(([titleKey, bodyKey]) => (
            <Column key={titleKey} sm={4} md={4} lg={5}>
              <Tile style={{ height: "100%", padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "var(--cds-text-primary)",
                  }}
                >
                  {t(titleKey)}
                </h3>
                <p style={{ color: "var(--cds-text-secondary)", lineHeight: 1.6 }}>
                  {t(bodyKey)}
                </p>
              </Tile>
            </Column>
          ))}
        </Grid>
      </section>

      {/* Prerequisites */}
      <section
        style={{
          padding: "3rem 2rem",
          background: "var(--cds-background-selected-hover)",
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
              {(
                [
                  "prereq_node",
                  "prereq_python",
                  "prereq_ollama",
                  "prereq_podman",
                ] as const
              ).map((key) => (
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
              ))}
            </ul>
          </Column>
        </Grid>
      </section>
    </main>
  );
}

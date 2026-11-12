"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button, Modal, Tag } from "@carbon/react";
import {
  Information,
  Enterprise,
  Security,
  IbmCloudSecurityComplianceCenter,
  Partnership,
  Locked,
  Application,
  ChevronLeft,
  ChevronRight,
} from "@carbon/icons-react";
import type { CarbonIconType } from "@carbon/icons-react";

interface UseCaseCard {
  id: string;
  icon: CarbonIconType;
  tagKey: string;
}

const USE_CASE_CARDS: UseCaseCard[] = [
  { id: "legacy",     icon: Enterprise,                       tagKey: "tag_mainframe" },
  { id: "air_gapped", icon: Locked,                           tagKey: "tag_enterprise" },
  { id: "devsecops",  icon: IbmCloudSecurityComplianceCenter, tagKey: "tag_security" },
  { id: "acp",        icon: Application,                      tagKey: "tag_editor" },
  { id: "hybrid",     icon: Partnership,                      tagKey: "tag_workflow" },
  { id: "modes",      icon: Security,                         tagKey: "tag_compliance" },
];

export function WhyBobModal() {
  const t = useTranslations("whyBob");
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <>
      <Button
        kind="tertiary"
        size="md"
        renderIcon={Information}
        onClick={() => setOpen(true)}
        style={{ marginBottom: "1.5rem" }}
      >
        {t("trigger_label")}
      </Button>

      <Modal
        open={open}
        onRequestClose={() => setOpen(false)}
        modalHeading={t("modal_heading")}
        passiveModal
        size="lg"
      >
        <p style={{ marginBottom: "1.5rem", color: "var(--cds-text-secondary)", lineHeight: 1.6 }}>
          {t("modal_intro")}
        </p>

        {/* Scroll arrows + card strip */}
        <div style={{ position: "relative" }}>
          {/* Left arrow */}
          <button
            aria-label={t("scroll_left")}
            onClick={() => scrollBy(-320)}
            style={{
              position: "absolute",
              left: "-0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              background: "var(--cds-layer-02)",
              border: "1px solid var(--cds-border-subtle)",
              borderRadius: "50%",
              width: "2rem",
              height: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--cds-text-primary)",
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Card strip */}
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              gap: "1rem",
              overflowX: "auto",
              paddingBlock: "0.5rem",
              paddingInline: "1.25rem",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "thin",
            }}
          >
            {USE_CASE_CARDS.map(({ id, icon: Icon, tagKey }) => (
              <div
                key={id}
                style={{
                  flex: "0 0 260px",
                  scrollSnapAlign: "start",
                  background: "var(--cds-layer-02)",
                  border: "1px solid var(--cds-border-subtle)",
                  borderRadius: "4px",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ color: "var(--cds-interactive)" }}>
                  <Icon size={32} />
                </div>
                <Tag type="blue" size="sm" style={{ alignSelf: "flex-start" }}>
                  {t(tagKey)}
                </Tag>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: "var(--cds-text-primary)",
                    margin: 0,
                  }}
                >
                  {t(`card_${id}_title`)}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--cds-text-secondary)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {t(`card_${id}_body`)}
                </p>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            aria-label={t("scroll_right")}
            onClick={() => scrollBy(320)}
            style={{
              position: "absolute",
              right: "-0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              background: "var(--cds-layer-02)",
              border: "1px solid var(--cds-border-subtle)",
              borderRadius: "50%",
              width: "2rem",
              height: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--cds-text-primary)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </Modal>
    </>
  );
}

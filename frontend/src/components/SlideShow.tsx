"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@carbon/react";
import { ChevronLeft, ChevronRight, Home, Maximize } from "@carbon/icons-react";
import type { ReactNode } from "react";
import { getAnimation, type AnimationName } from "@/lib/animations";

export interface Slide {
  title: string;
  body?: string;
  /** Scene to render as a CSS/JS animation component (see lib/animations.ts). */
  animation?: AnimationName;
  component?: ReactNode;
}

interface SlideShowProps {
  slides: Slide[];
}

export default function SlideShow({ slides }: SlideShowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("demo");
  const tnav = useTranslations("nav");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const current = Math.min(Math.max(Number(searchParams.get("slide") ?? "1"), 1), total);
  const slide = slides[current - 1];

  const go = useCallback(
    (n: number) => {
      const next = Math.min(Math.max(n, 1), total);
      router.replace(`?slide=${next}`);
    },
    [router, total],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(current + 1);
      else if (e.key === "ArrowLeft") go(current - 1);
      else if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--cds-background)",
        overflow: "hidden",
      }}
    >
      {/* Slide content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 4rem",
          textAlign: "center",
        }}
      >
        {slide.animation &&
          (() => {
            const Animation = getAnimation(slide.animation);
            if (Animation) {
              return (
                <div style={{ marginBottom: "2rem" }}>
                  <Animation />
                </div>
              );
            }
            // Animation not built yet — keep the slide usable with a placeholder.
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "40vh",
                  width: "min(640px, 100%)",
                  marginBottom: "2rem",
                  border: "1px dashed var(--cds-border-subtle)",
                  borderRadius: "4px",
                  color: "var(--cds-text-helper)",
                  fontSize: "0.875rem",
                }}
              >
                {t("animation_pending").replace("{scene}", slide.animation)}
              </div>
            );
          })()}
        {slide.component}
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            fontWeight: 300,
            color: "var(--cds-text-primary)",
            marginBottom: "1rem",
          }}
        >
          {slide.title}
        </h1>
        {slide.body && (
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.375rem)",
              color: "var(--cds-text-secondary)",
              maxWidth: "640px",
              lineHeight: 1.6,
            }}
          >
            {slide.body}
          </p>
        )}
      </div>

      {/* Nav bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          borderTop: "1px solid var(--cds-border-subtle)",
          background: "var(--cds-layer-01)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Button
            as={Link}
            href={`/${locale}`}
            kind="ghost"
            size="sm"
            renderIcon={Home}
          >
            {tnav("home")}
          </Button>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ChevronLeft}
            onClick={() => go(current - 1)}
            disabled={current === 1}
            iconDescription={t("prev")}
          >
            {t("prev")}
          </Button>
        </div>

        <span style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
          {t("slide_counter")
            .replace("{current}", String(current))
            .replace("{total}", String(total))}
        </span>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Maximize}
            iconDescription={t("fullscreen")}
            hasIconOnly
            onClick={() => {
              if (!document.fullscreenElement) {
                containerRef.current?.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
          />
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ChevronRight}
            onClick={() => go(current + 1)}
            disabled={current === total}
            iconDescription={t("next")}
          >
            {t("next")}
          </Button>
        </div>
      </nav>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@carbon/react";
import { ChevronLeft, ChevronRight, Home, Maximize } from "@carbon/icons-react";
import type { ReactNode } from "react";
import { getAnimation, type AnimationName } from "@/lib/animations";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import styles from "./SlideShow.module.css";

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
      {/* Slide content (scrolls instead of pushing the nav bar off-screen) */}
      <div className={styles.stage}>
        <div className={styles.content}>
          {slide.animation &&
            (() => {
              const Animation = getAnimation(slide.animation);
              if (Animation) {
                return (
                  <div className={styles.animation}>
                    <Animation />
                  </div>
                );
              }
              // Animation not built yet — keep the slide usable with a placeholder.
              return (
                <div
                  className={styles.animation}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "40vh",
                    width: "min(640px, 100%)",
                    border: "1px dashed var(--cds-border-subtle)",
                    borderRadius: "4px",
                    color: "var(--cds-text-helper)",
                    fontSize: "0.875rem",
                  }}
                >
                  {t("animation_pending", { scene: slide.animation })}
                </div>
              );
            })()}
          {slide.component}
          <h1 className={styles.title}>{slide.title}</h1>
          {slide.body && <p className={styles.body}>{slide.body}</p>}
        </div>
      </div>

      {/* Nav bar */}
      <nav className={styles.nav} aria-label={t("slide_counter", { current, total })}>
        <div className={styles.navGroup}>
          <Button
            as={Link}
            href={`/${locale}`}
            kind="ghost"
            size="sm"
            renderIcon={Home}
            className={styles.navButton}
          >
            <span className={styles.label}>{tnav("home")}</span>
          </Button>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={ChevronLeft}
            onClick={() => go(current - 1)}
            disabled={current === 1}
            iconDescription={t("prev")}
            className={styles.navButton}
          >
            <span className={styles.label}>{t("prev")}</span>
          </Button>
        </div>

        <span className={styles.counter}>
          <span className={styles.counterLong}>{t("slide_counter", { current, total })}</span>
          <span className={styles.counterShort} aria-hidden="true">
            {current} / {total}
          </span>
        </span>

        <div className={styles.navGroup}>
          <LocaleSwitcher />
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
            className={styles.navButton}
          >
            <span className={styles.label}>{t("next")}</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

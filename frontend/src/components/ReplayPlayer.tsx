"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@carbon/react";
import { getAnimation } from "@/lib/animations";
import type { Replay, ReplayStep } from "@/lib/replay-schema";
import styles from "./ReplayPlayer.module.css";

const AUTO_MS = 1800;

export interface ReplayPlayerProps {
  replay: Replay;
  /** Optional "what if?" variant, already validated on the server. */
  variant?: Replay;
}

function stepLabel(step: ReplayStep): string {
  switch (step.type) {
    case "rule":
    case "skill":
      return step.name;
    case "tool_call":
      return step.tool;
    case "file":
      return step.path;
    default:
      return "";
  }
}

const COLLAPSE_LINES = 12;

function StepView({ step, tag }: { step: ReplayStep; tag: string }) {
  const t = useTranslations("replay");
  const [expanded, setExpanded] = useState(false);
  const label = stepLabel(step);
  const body =
    step.type === "prompt" || step.type === "assistant" || step.type === "tool_result" || step.type === "run_output"
      ? step.text
      : step.type === "tool_call"
        ? step.input
        : step.type === "file"
          ? step.content
          : "";
  const lines = body.split("\n");
  const collapsible = lines.length > COLLAPSE_LINES;
  const shownBody = collapsible && !expanded ? lines.slice(0, COLLAPSE_LINES).join("\n") : body;
  const isCode = step.type === "file" || step.type === "tool_call" || step.type === "run_output" || step.type === "tool_result";
  return (
    <div className={styles.step}>
      <span className={styles.tag}>{tag}</span>
      {label ? <strong>{label}</strong> : null}
      {body ? isCode ? <pre className={styles.code}>{shownBody}</pre> : <div>{shownBody}</div> : null}
      {collapsible ? (
        <Button size="sm" kind="ghost" onClick={() => setExpanded((e) => !e)}>
          {expanded ? t("show_less") : t("show_more", { count: lines.length - COLLAPSE_LINES })}
        </Button>
      ) : null}
    </div>
  );
}

function Session({ replay, idKey }: { replay: Replay; idKey: string }) {
  const t = useTranslations("replay");
  const tItem = useTranslations(`replays.${idKey}`);
  const total = replay.steps.length;
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    if (shown >= total) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setShown((n) => Math.min(n + 1, total)), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [playing, shown, total]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [shown]);

  const visible = replay.steps.slice(0, shown);
  const lastAnim = [...visible].reverse().find((s) => s.animation)?.animation;
  const Anim = lastAnim ? getAnimation(lastAnim) : undefined;
  const revealed = picked !== null;
  const choices = [0, 1, 2];

  return (
    <div className={styles.root}>
      <div className={styles.banner} data-source={replay.source} role="note">
        {replay.source === "recorded"
          ? t("recorded", { version: replay.bobVersion ?? "?", date: replay.recordedAt ?? "?" })
          : t("sample")}
        {replay.pins
          ? ` ${t("pins")}: ${Object.entries(replay.pins).map(([k, v]) => `${k} ${v}`).join(", ")}`
          : ""}
      </div>

      <h2>{tItem("title")}</h2>

      <section className={styles.predict} aria-label={t("predict")}>
        <strong>{t("predict")}</strong>
        <div>{tItem("question")}</div>
        <div className={styles.choices}>
          {choices.map((i) => (
            <Button
              key={i}
              kind="tertiary"
              size="md"
              className={styles.choice}
              disabled={revealed}
              data-state={revealed ? (i === replay.predictAnswer ? "right" : i === picked ? "wrong" : "") : ""}
              onClick={() => setPicked(i)}
            >
              {tItem(`choice${i}`)}
            </Button>
          ))}
        </div>
        {revealed ? (
          <div role="status">
            {picked === replay.predictAnswer ? t("right") : t("wrong")} {tItem("explain")}
          </div>
        ) : null}
      </section>

      <div className={styles.stage}>
        <div className={styles.terminal} aria-live="polite">
          {visible.length === 0 ? <span className={styles.counter}>{t("press_play")}</span> : null}
          {visible.map((s, i) => (
            <StepView key={i} step={s} tag={t(`step.${s.type}`)} />
          ))}
          <div ref={endRef} />
        </div>
        <div className={styles.visual}>{Anim ? <Anim /> : <span className={styles.counter}>{t("no_visual")}</span>}</div>
      </div>

      <div className={styles.controls}>
        <Button size="md" kind="secondary" onClick={() => setShown((n) => Math.max(n - 1, 0))} disabled={shown === 0}>
          {t("back")}
        </Button>
        <Button size="md" onClick={() => setPlaying((p) => !p)} disabled={shown >= total}>
          {playing ? t("pause") : t("play")}
        </Button>
        <Button size="md" kind="secondary" onClick={() => setShown((n) => Math.min(n + 1, total))} disabled={shown >= total}>
          {t("next")}
        </Button>
        <Button size="md" kind="ghost" onClick={() => { setShown(0); setPlaying(false); }}>
          {t("restart")}
        </Button>
        <span className={styles.counter}>{t("counter", { current: shown, total })}</span>
      </div>

      {shown >= total ? (
        <section className={styles.card}>
          <strong>{t("takehome")}</strong>
          <div>{tItem("takehome")}</div>
        </section>
      ) : null}
    </div>
  );
}

export function ReplayPlayer({ replay, variant }: ReplayPlayerProps) {
  const t = useTranslations("replay");
  const [showVariant, setShowVariant] = useState(false);
  const active = showVariant && variant ? variant : replay;
  return (
    <div>
      {variant ? (
        <div className={styles.controls} style={{ padding: "1rem 1rem 0", maxWidth: "64rem", margin: "0 auto" }}>
          <Button size="sm" kind={showVariant ? "tertiary" : "primary"} onClick={() => setShowVariant(false)}>
            {t("main_run")}
          </Button>
          <Button size="sm" kind={showVariant ? "primary" : "tertiary"} onClick={() => setShowVariant(true)}>
            {t("what_if")}
          </Button>
        </div>
      ) : null}
      <Session key={active.id} replay={active} idKey={active.id} />
    </div>
  );
}

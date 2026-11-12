"use client";

import { ContentSwitcher, Switch } from "@carbon/react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { isLocale, localeLabels, locales } from "@/i18n/config";
import styles from "./LocaleSwitcher.module.css";

/**
 * Language switcher usable on any page: swaps the leading `/[locale]` path
 * segment and keeps the rest of the path and the query string (e.g. the
 * current `?slide=N` in the slideshow).
 */
export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");
  const selectedIndex = Math.max(locales.indexOf(locale as (typeof locales)[number]), 0);

  function handleChange(selected: { name?: string | number }) {
    const next = String(selected.name);
    if (next === locale || !isLocale(next)) return;

    const segments = pathname.split("/");
    if (segments.length > 1 && isLocale(segments[1])) segments[1] = next;
    else segments.splice(1, 0, next);

    // Read the query string at click time (avoids useSearchParams' Suspense requirement).
    router.replace(`${segments.join("/")}${window.location.search}`);
  }

  return (
    <div role="group" aria-label={t("language")} className={styles.switcher}>
      <ContentSwitcher selectedIndex={selectedIndex} onChange={handleChange} size="sm">
        {locales.map((l) => (
          <Switch key={l} name={l} text={localeLabels[l]} />
        ))}
      </ContentSwitcher>
    </div>
  );
}

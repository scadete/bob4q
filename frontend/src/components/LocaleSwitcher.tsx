"use client";

import { ContentSwitcher, Switch } from "@carbon/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface LocaleSwitcherProps {
  currentLocale: string;
  slug: string;
  labelKey: string;
}

export default function LocaleSwitcher({ currentLocale, slug }: LocaleSwitcherProps) {
  const router = useRouter();
  const locales = ["en", "pt-BR"];
  const selectedIndex = locales.indexOf(currentLocale);

  function handleChange(selected: { name?: string | number }) {
    const next = String(selected.name);
    router.push(`/docs/${next}/${slug}`);
  }

  return (
    <ContentSwitcher selectedIndex={selectedIndex} onChange={handleChange} size="sm">
      <Switch name="en" text="EN" />
      <Switch name="pt-BR" text="PT-BR" />
    </ContentSwitcher>
  );
}

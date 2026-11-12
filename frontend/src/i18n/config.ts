/**
 * Locale configuration shared by the middleware, server request config, and
 * client components (kept free of server-only imports so it is client-safe).
 */
export const locales = ["en", "pt-BR"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Short labels shown in the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: "EN",
  "pt-BR": "PT-BR",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

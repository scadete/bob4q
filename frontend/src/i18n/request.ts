import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale } from "./config";

export { locales, type Locale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale;
  if (!isLocale(locale)) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

import { defaultLocale, locales } from "@/i18n/config";
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales,
  defaultLocale,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

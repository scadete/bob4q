import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
// Self-hosted IBM Plex @font-face declarations (must load before Carbon so
// its 'IBM Plex Sans'/'IBM Plex Mono' font-family stacks resolve to our files).
import "./fonts.css";
// Carbon Design System global styles (tokens, reset, component CSS).
import "@carbon/styles/css/styles.css";
// KaTeX styles for math rendered in docs and notebook markdown cells.
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Quantum Experience Lab",
  description: "Hands-on quantum computing workshop with IBM Bob + Qiskit",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      {/* g100 theme class at the body level so tokens apply to the whole page,
          including the background (Carbon's reset styles <body>). */}
      <body className="cds--g100">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

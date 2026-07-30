import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Theme } from "@carbon/react";
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
      <body>
        <NextIntlClientProvider messages={messages}>
          <Theme theme="g100">{children}</Theme>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

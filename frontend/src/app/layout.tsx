import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quantum Experience Lab",
  description: "Hands-on quantum computing workshop with IBM Bob + Qiskit",
};

// Root layout required by Next.js App Router;
// The real layout with providers is in app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

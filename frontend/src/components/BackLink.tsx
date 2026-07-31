import Link from "next/link";

/** Small "← label" navigation link used to return to a parent page. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        color: "var(--cds-link-primary)",
        fontSize: "0.875rem",
        textDecoration: "none",
      }}
    >
      <span aria-hidden>←</span> {label}
    </Link>
  );
}

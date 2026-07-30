// @ts-check
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  /**
   * COOP / COEP headers — required for SharedArrayBuffer, which Pyodide (and
   * therefore JupyterLite) depends on.  Applied to ALL routes; the iframe picks
   * them up via the parent page context.
   *
   * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      // JupyterLite static assets need CORP header so the parent page (COEP)
      // can load them cross-origin inside the iframe.
      {
        source: "/jupyterlite/(.*)",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

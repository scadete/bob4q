"use client";

/**
 * LabEmbed
 * Renders the JupyterLite static bundle (frontend/public/jupyterlite/) inside
 * an iframe.  The COOP/COEP headers required by SharedArrayBuffer (Pyodide WASM)
 * are set in next.config.ts → headers().
 *
 * Dynamic import (no SSR) avoids window-is-not-defined errors.
 */

import { useEffect, useRef, useState } from "react";
import { Loading } from "@carbon/react";

interface LabEmbedProps {
  /** Path inside JupyterLite to open, e.g. "notebooks/01-quantum-fundamentals.ipynb" */
  notebookPath?: string;
}

export function LabEmbed({ notebookPath }: LabEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const src = notebookPath
    ? `/jupyterlite/index.html?path=${encodeURIComponent(notebookPath)}`
    : "/jupyterlite/index.html";

  // Once the iframe fires "load" the JupyterLite shell is at least bootstrapped.
  // Pyodide itself will keep loading inside the iframe; nothing to do on our end.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function handleLoad() {
      setReady(true);
    }

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, []);

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Loading overlay — shown until iframe fires "load" */}
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--cds-background)",
            gap: "1rem",
            zIndex: 1,
          }}
        >
          <Loading description="Loading JupyterLite…" withOverlay={false} />
          <span style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
            Loading JupyterLite… this takes ~10 s on first visit
          </span>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
        title="JupyterLite"
        allow="cross-origin-isolated"
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms allow-modals allow-popups"
      />
    </div>
  );
}

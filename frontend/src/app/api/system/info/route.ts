import { NextResponse } from "next/server";

/**
 * GET /api/system/info
 *
 * Probed by Bob IDE's Shell Companion extension to detect a running dev server
 * and gather basic project metadata. Without this route the request falls
 * through to the next-intl locale middleware, which redirects it to
 * /en/api/system/info, which in turn matches the middleware again — causing an
 * infinite redirect loop and a flood of 404 errors in the console.
 */
export function GET() {
  return NextResponse.json({
    name: "bob4q",
    description: "Quantum Experience Lab — IBM Bob + Qiskit workshop demo",
    version: process.env.npm_package_version ?? "0.0.0",
  });
}

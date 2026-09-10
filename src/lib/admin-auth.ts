import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

/**
 * Fail-closed admin key check.
 *
 * Rules:
 *   - No ADMIN_API_KEY configured → reject (500) — never fail open.
 *   - Missing/wrong key → 401.
 *   - Comparison is constant-time.
 *
 * Usage inside a route handler:
 *   const auth = requireAdmin(request);
 *   if (auth) return auth; // it IS an error response
 */
export function requireAdmin(request: Request): NextResponse | null {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    // Server misconfigured — deny loudly instead of opening the door.
    console.error("[admin] ADMIN_API_KEY is not configured — refusing request");
    return NextResponse.json(
      { error: "Server misconfigured: admin key missing" },
      { status: 500 },
    );
  }
  const provided = request.headers.get("x-admin-key");
  if (!provided || !safeEqual(provided, adminKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // authorized
}

/**
 * Non-throwing timing-safe check if a request has a valid admin key.
 */
export function isAdminRequest(request: Request): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const provided = request.headers.get("x-admin-key");
  if (!provided) return false;
  return safeEqual(provided, adminKey);
}

function safeEqual(a: string, b: string): boolean {
  // NOTE (§25 master prompt): current design relies on ADMIN_API_KEY header.
  // Production-hardening requires server-set HttpOnly cookie / signed session instead.
  // This module remains fail-closed (no open-by-default); full auth redesign is PENDING.
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}


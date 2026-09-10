// DOH-NUT — Production database architecture (PostgreSQL preferred)
// This architecture is INTENTIONALLY fail-closed: if a persistent production
// DATABASE_URL (postgresql://...) is not configured, the app will fail
// explicitly rather than silently falling back to SQLite /tmp for production
// order/payment data (§18 master prompt).
//
// Development: SQLite acceptable ONLY for local dev / testing.
// Production: PostgreSQL (Supabase / Neon / Vercel Postgres / user-provided).
// Migration strategy: `prisma db push` + `prisma migrate deploy` for production.
// SQLite-specific PRAGMA / raw DDL (from ensure-ready.ts) must NOT run in production.

import { PrismaClient } from "@prisma/client";

export const db: PrismaClient = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Fail-closed check (§18): in production (NODE_ENV=production or VERCEL=1),
// DATABASE_URL must point to PostgreSQL (postgresql:// or postgres://).
// If not configured correctly, throw immediately — do NOT silently fall back.
export function verifyProductionDBConfig(): void {
  const env = process.env.NODE_ENV || "development";
  const isProduction = env === "production" || process.env.VERCEL === "1";
  const url = process.env.DATABASE_URL || "";

  if (!isProduction) {
    // Development: SQLite file DB acceptable for local development / CI tests.
    return;
  }

  if (!url) {
    throw new Error(
      "[DOH-NUT DB] PRODUCTION FAIL-CLOSED: DATABASE_URL is not set. " +
        "Production requires PostgreSQL (postgresql://...). " +
        "Do NOT rely on SQLite /tmp fallback for customer/order/payment data. " +
        "Configure DATABASE_URL via environment variables."
    );
  }

  // Require PostgreSQL schema in production — reject SQLite file URLs.
  if (url.startsWith("file:") || url.includes("sqlite")) {
    throw new Error(
      "[DOH-NUT DB] PRODUCTION FAIL-CLOSED: DATABASE_URL points to SQLite (" +
        url + "). SQLite /tmp is NOT acceptable for production customer/order/payment persistence. " +
        "Switch to PostgreSQL (postgresql://). See master prompt §16-§19."
    );
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    throw new Error(
      "[DOH-NUT DB] PRODUCTION FAIL-CLOSED: DATABASE_URL must use postgresql:// (got: " +
        url.substring(0, Math.min(url.indexOf("://"), 30)) + 
        "...). Configure a persistent PostgreSQL provider (Supabase/Neon/Vercel Postgres/user-provided)."
    );
  }
}

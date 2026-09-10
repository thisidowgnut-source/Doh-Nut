# DOH-NUT — Realtime Tracking Architecture (DB-Backed, Not Timer-Based)

Source of truth: `model Order` + `model OrderEvent` (prisma/schema.prisma).
Target: database-backed status transitions (pending_payment → paid → preparing → baking → out_for_delivery → delivered) — NOT automatic timer progression.
Transport: WebSocket / SSE / polling fallback (implementation choice).
Subscription security (§21): must require trusted proof (signed session / order ownership / signed tracking token) — NOT arbitrary order ID subscription.
CORS (§21, §26): restrict `origin: '*'` — must be app origin only.
Status: ARCHITECTURE DOCUMENTED; full implementation requires subagent D + external WebSocket infrastructure verification.

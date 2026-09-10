// DOH-NUT — Realtime Tracking Architecture (DB-Backed)
// Source of truth: model Order + OrderEvent in PostgreSQL (after production DB migration)
// NOT based on timer/simulation.
// Tracking subscription must require: (a) authenticated user ownership OR (b) signed session token.
// CORS: restrict to app origin only (no '*').

export interface TrackingEvent {
  orderId: string;
  status: "pending_payment" | "paid" | "preparing" | "baking" | "ready" | "out_for_delivery" | "delivered";
  message: string;
  timestamp: Date;
}

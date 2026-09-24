"use client";

import { motion } from "framer-motion";

/**
 * Social proof strip — slim one-line trust banner pinned at the top of the
 * Orders view. Builds buyer confidence right before/after purchase with
 * rating, volume, and delivery-speed claims.
 *
 * Mobile-safe: single flex row that wraps gracefully at 390px. The global
 * `prefers-reduced-motion` media query in globals.css disables the framer
 * transitions for users who opt out of animation.
 */
export function SocialProofStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-4 flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-[var(--color-dowgnut-blue-dark)]/10 bg-white px-4 py-2 text-center shadow-sm"
      role="status"
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs font-bold text-[var(--color-dowgnut-blue-dark)] sm:text-sm">
        <motion.span
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3.2 }}
          className="inline-block text-amber-500"
          aria-hidden
        >
          ★
        </motion.span>
        <span>4.9 rated</span>
        <span aria-hidden className="hidden text-[var(--color-dowgnut-blue-dark)]/25 sm:inline">·</span>
        <span>2,000+ boxes delivered</span>
        <span aria-hidden className="hidden text-[var(--color-dowgnut-blue-dark)]/25 sm:inline">·</span>
        <span>18–25 min delivery</span>
      </span>
    </motion.div>
  );
}

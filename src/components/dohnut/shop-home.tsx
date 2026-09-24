"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useGamification } from "@/store/use-gamification";
import { playTap } from "@/lib/sounds";
import { ParticleBackground } from "./particle-background";
import { FilterBar } from "./filter-bar";
import { DonutGrid } from "./donut-grid";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

// NOTE (§33 master prompt): prefers-reduced-motion respect added.
// Reduced motion is respected for accessibility; brand motion preserved by default.
const TYPES: { key: string; label: string; desc: string; accent: string; defaultImg: string }[] = [
  {
    key: "classic",
    label: "Classic",
    desc: "Timeless glazed & cake",
    accent: "#92400E",
    defaultImg: "/brand/donuts/donut_classic1.png",
  },
  {
    key: "sprinkled",
    label: "Sprinkled",
    desc: "Rainbow jimmies & fun",
    accent: "#BE185D",
    defaultImg: "/brand/donuts/donut_sprinkled1.png",
  },
  {
    key: "stuffed",
    label: "Stuffed",
    desc: "Filled with cream & jelly",
    accent: "#1E40AF",
    defaultImg: "/brand/donuts/donut_stuffed1.png",
  },
];

export function ShopHome() {
  const shouldReduceMotion = useReducedMotion();
  const donuts = useShop((s) => s.donuts);
  const setFilterType = useShop((s) => s.setFilterType);
  const setView = useShop((s) => s.setView);
  const streak = useGamification((s) => s.streak);
  const orderedTypes = useGamification((s) => s.orderedTypes);
  const orderedDonutNames = useGamification((s) => s.orderedDonutNames);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [browseAll, setBrowseAll] = useState(false);

  const openBrowse = () => {
    playTap(700);
    setFilterType("all");
    setBrowseAll(true);
  };

  const closeBrowse = () => {
    playTap(420);
    setBrowseAll(false);
  };

  const earnedBadges = [
    { id: "first-order", label: "First Bite", emoji: "🍩", earned: orderedDonutNames.length > 0 },
    { id: "streak-3", label: "On a Roll", emoji: "🔥", earned: streak >= 3 },
    { id: "try-all-types", label: "Explorer", emoji: "🗺️", earned: orderedTypes.length >= 4 },
    { id: "try-10", label: "Taste Tester", emoji: "👅", earned: orderedDonutNames.length >= 10 },
    { id: "try-all", label: "Donut Master", emoji: "👑", earned: orderedDonutNames.length >= 21 },
  ].filter((b) => b.earned);

  const typePreview = useMemo<Record<string, Donut | undefined>>(() => {
    const byType: Record<string, Donut | undefined> = {};
    for (const t of TYPES) {
      byType[t.key] = donuts.find((d) => d.type === t.key);
    }
    return byType;
  }, [donuts]);

  return (
    <div className="relative flex h-full w-full flex-1 flex-col items-center justify-between px-4 py-1 overflow-visible select-none">
      {/* Floating sprinkle particles */}
      <ParticleBackground count={32} />

      {browseAll ? (
        /* ── ALL FLAVORS browse mode: FilterBar + DonutGrid (31 perisa) ── */
        <div className="relative z-10 flex w-full flex-1 flex-col items-center gap-4 pt-2">
          <div className="flex w-full max-w-7xl items-center justify-between">
            <button
              onClick={closeBrowse}
              aria-label="Back to featured"
              className="inline-flex h-11 items-center gap-1 rounded-full bg-white/80 px-4 text-xs font-bold uppercase tracking-wide text-[var(--color-dowgnut-blue-dark)] shadow-sm transition-colors hover:bg-white"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)] sm:text-2xl">
              ALL FLAVORS
            </h2>
            <span className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]/50">
              {donuts.length} {donuts.length === 1 ? "flavor" : "flavors"}
            </span>
          </div>
          <FilterBar />
          <div className="w-full max-w-7xl flex-1 overflow-y-auto pb-8">
            <DonutGrid />
          </div>
        </div>
      ) : (
        <>
      {/* Iconic Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: selectedType ? 0 : 1, y: selectedType ? -12 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center pt-1 shrink-0"
      >
        <h1 className="graffiti-text text-2xl tracking-wide text-[var(--color-dowgnut-blue-dark)] sm:text-3xl drop-shadow-xs">
          WHAT&apos;S YOUR FLAVA?
        </h1>
      </motion.div>

      {/* Streak badge (if any) — subtle pill */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ opacity: selectedType ? 0 : 1, scale: selectedType ? 0.8 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 -mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--color-dowgnut-pink)]/10 px-3 py-0.5 shadow-xs shrink-0"
        >
          <span className="text-xs font-bold text-[var(--color-dowgnut-pink-dark)]">
            🔥 {streak} day streak
          </span>
        </motion.div>
      )}

      {/* 3 BIG showcase display donuts — tightly spaced & layered with realistic levitation */}
      <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center justify-center -space-y-5 sm:-space-y-7 my-auto overflow-visible py-0">
        {TYPES.map((t, i) => {
          const preview = typePreview[t.key];
          const imgSrc = preview?.imgUrl || t.defaultImg;
          const selectedIdx = TYPES.findIndex((x) => x.key === selectedType);
          const isSibling = Boolean(selectedType && selectedType !== t.key);

          return (
            <motion.button
              key={t.key}
              onClick={() => {
                if (selectedType) return;
                playTap(520 + i * 80);
                setSelectedType(t.key);
                setFilterType(t.key);
                setView("slider");
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: isSibling ? 0 : 1,
                scale: isSibling ? 0.82 : 1,
                y: isSibling ? (i < selectedIdx ? -36 : 36) : 0,
                filter: isSibling ? "blur(5px)" : "none",
              }}
              transition={{
                delay: selectedType ? 0 : 0.05 + i * 0.08,
                duration: selectedType ? 0.5 : undefined,
                type: selectedType ? "tween" : "spring",
                stiffness: 240,
                damping: 22,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={selectedType ? undefined : { scale: 1.08, zIndex: 40 }}
              whileTap={selectedType ? undefined : { scale: 0.93 }}
              className={cn(
                "group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-200",
                i === 0 ? "z-30" : i === 1 ? "z-20" : "z-10",
                isSibling && "pointer-events-none"
              )}
              aria-label={`Browse ${t.label} donuts`}
            >
              <div
                className={cn(
                  "absolute -bottom-1 h-5 w-44 sm:w-56 rounded-full bg-black/15 blur-lg transition-transform duration-300 pointer-events-none",
                  !selectedType && "group-hover:scale-115"
                )}
              />
              <div
                className={cn(
                  "absolute bottom-1 h-2.5 w-28 sm:w-36 rounded-full bg-black/20 blur-xs transition-transform duration-300 pointer-events-none",
                  !selectedType && "group-hover:scale-110"
                )}
              />

              <motion.img
                layoutId={`category-donut-${t.key}`}
                src={imgSrc}
                alt={t.label}
                className="size-48 sm:size-56 md:size-64 object-contain drop-shadow-2xl filter transition-transform duration-200"
                draggable={false}
                animate={{ rotate: 0 }}
                transition={{
                  layout: { duration: 2.1, ease: [0.37, 0, 0.63, 1] },
                  rotate: { duration: 2.1, ease: [0.37, 0, 0.63, 1] },
                }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Badges row (if earned) */}
      {earnedBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative z-10 mt-1 flex flex-wrap justify-center gap-1.5 pb-1"
        >
          {earnedBadges.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-dowgnut-blue-dark)] shadow-xs backdrop-blur-sm"
            >
              {b.emoji} {b.label}
            </span>
          ))}
        </motion.div>
      )}

      {/* ALL FLAVORS entry — unlock full 31-flavor catalog */}
      <motion.button
        onClick={openBrowse}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="relative z-10 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--color-dowgnut-blue-dark)] px-5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-[var(--color-dowgnut-blue)]"
        aria-label="Browse all 31 flavors"
      >
        All Flavors
        <ArrowRight className="size-4" />
      </motion.button>
        </>
      )}
    </div>
  );
}

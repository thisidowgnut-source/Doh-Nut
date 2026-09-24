"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  animate,
  type PanInfo,
  type MotionValue,
} from "framer-motion";
import { Heart, Minus, Plus, ArrowLeft, Loader2, Check } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useToast } from "@/hooks/use-toast";
import { playSwipe, playAddToCart, playFavorite, playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

/**
 * DonutSlider — 3D ring display showing donuts of the selected category.
 * Center donut = active, with nutrition + qty + add to cart below.
 *
 * Motion language (per Emil Kowalski standards):
 * - Snap spring inherits drag velocity + projects momentum → physical flicks.
 * - The ring leans into its rotation (velocity-driven rotateZ, spring-smoothed).
 * - Info card crossfades directionally in ~190ms — both cards animate
 *   simultaneously (popLayout), no dead gap between donuts.
 * - Newly-centered donut gets a small landing pulse (suppressed mid-drag).
 * - Tap any side donut to spin it to center (pan handlers live on the ring
 *   container itself, so clicks reach the cards).
 * - Parabolic Fly-to-Cart trajectory with harmonic audio feedback.
 */

const PX_PER_DONUT = 150; // 150px drag = 1 donut slot (stable, weighted swipe)
const TILT = 56;
const RADIUS = 160;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function wrapOffset(o: number, len: number) {
  if (len <= 0) return 0;
  const half = len / 2;
  return ((((o + half) % len) + len) % len) - half;
}

function slot(o: number, len: number) {
  if (len <= 0)
    return { x: 0, y: 0, scale: 1, opacity: 1, blur: 0, zIndex: 10 };
  const angleDeg = (o / len) * 360;
  const rad = (angleDeg * Math.PI) / 180;
  const diskX = Math.sin(rad) * RADIUS;
  const diskY = Math.cos(rad) * RADIUS;
  const tiltRad = (TILT * Math.PI) / 180;
  const x = diskX;
  const y = diskY * Math.cos(tiltRad);
  const depth = (1 - Math.cos(rad)) / 2;
  const inFront = Math.abs(angleDeg) <= 100;
  const opacity = inFront ? Math.max(0.4, 1 - depth * 0.5) : 0;
  const scale = 1 - depth * 0.25;
  const blur = depth * 2.5; // capped — heavy blur on 8 live cards janks low-end phones
  const zIndex = Math.round(20 - depth * 30);
  return { x, y, scale, opacity, blur, zIndex };
}

interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imgUrl: string;
}

/** One donut on the ring — derives all transforms from shared `position`. */
function RingCard({
  donut,
  index,
  position,
  len,
  isCenter,
  dragging,
  onCenter,
  onSelect,
  categoryLayoutId,
  detailOpen,
}: {
  donut: Donut;
  index: number;
  position: MotionValue<number>;
  len: number;
  isCenter: boolean;
  dragging: boolean;
  onCenter: () => void;
  onSelect: () => void;
  categoryLayoutId?: string;
  detailOpen: boolean;
}) {
  const wrapped = useTransform(position, (p: number) =>
    wrapOffset(index - p, len),
  );

  // Single-pass slot calculation per card to keep 60/120 FPS high performance
  const x = useTransform(wrapped, (o) => slot(o, len).x);
  const y = useTransform(wrapped, (o) => slot(o, len).y);
  const scale = useTransform(wrapped, (o) => slot(o, len).scale);
  const opacity = useTransform(wrapped, (o) => slot(o, len).opacity);
  const filter = useTransform(wrapped, (o) => {
    const b = slot(o, len).blur;
    return b < 0.15 ? "none" : `blur(${b.toFixed(2)}px)`;
  });
  const zIndex = useTransform(wrapped, (o) => slot(o, len).zIndex);

  return (
    <motion.button
      onClick={isCenter ? onSelect : onCenter}
      animate={{ opacity: !isCenter && detailOpen ? 0 : 1 }}
      transition={{ duration: 0.35 }}
      style={{
        x,
        y,
        scale,
        opacity,
        filter,
        zIndex,
        transformStyle: "preserve-3d",
        rotateX: -TILT,
      }}
      className="absolute left-1/2 top-1/2 flex size-44 -translate-x-1/2 -translate-y-1/2 touch-pan-y items-center justify-center cursor-pointer select-none sm:size-72"
      aria-label={donut.name}
    >
      {isCenter && detailOpen ? null : (
        <motion.img
          src={donut.imgUrl}
          alt={donut.name}
          layoutId={isCenter ? categoryLayoutId ?? `slider-donut-${donut.id}` : undefined}
          loading={isCenter ? "eager" : "lazy"}
          fetchPriority={isCenter ? "high" : "auto"}
          className={cn(
            "size-56 object-contain sm:size-80 select-none transition-all duration-300",
            isCenter
              ? "drop-shadow-[0_24px_30px_rgba(0,0,0,0.22)] scale-100"
              : "drop-shadow-lg scale-95 opacity-80"
          )}
          draggable={false}
          initial={
            isCenter
              ? // Half-donut cinematic spin-in: the clicked donut continues its
                // journey — spins up from below the ring into center stage.
                { opacity: 0, scale: 0.4, rotate: -160, y: 140 }
              : { opacity: 0, scale: 0.6 }
          }
          animate={{
            rotate: 360,
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            layout: { duration: 2.2, ease: [0.16, 1, 0.3, 1] },
            rotate: { duration: 2.2, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.8, delay: isCenter ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 0.8, delay: isCenter ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
          }}
        />
      )}
    </motion.button>
  );
}

export function DonutSlider() {
  const allDonuts = useShop((s) => s.donuts);
  const filterType = useShop((s) => s.filterType);
  const setFilterType = useShop((s) => s.setFilterType);
  const loadingDonuts = useShop((s) => s.loadingDonuts);
  const donutsError = useShop((s) => s.donutsError);
  const loadDonuts = useShop((s) => s.loadDonuts);
  const favorites = useShop((s) => s.favorites);
  const toggleFavorite = useShop((s) => s.toggleFavorite);
  const addToCart = useShop((s) => s.addToCart);
  const setView = useShop((s) => s.setView);
  const { toast } = useToast();

  const [added, setAdded] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const donuts =
    filterType && filterType !== "all"
      ? allDonuts.filter((d) => d.type === filterType)
      : allDonuts;

  const len = donuts.length;
  const position = useMotionValue<number>(0);
  const [center, setCenter] = useState(0);
  const [qty, setQty] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const dragStartPos = useRef(0);
  const snapTarget = useRef(0);

  // Category change → reset picker state
  const catKey = `${filterType}:${len}`;
  const [prevCatKey, setPrevCatKey] = useState(catKey);
  if (prevCatKey !== catKey) {
    setPrevCatKey(catKey);
    setQty(1);
    setAdded(false);
  }

  useEffect(() => {
    snapTarget.current = 0;
    if (position.get() !== 0) {
      animate(position, 0, { type: "spring", stiffness: 280, damping: 36 });
    }
  }, [filterType, len]);

  // Real-time sync of center index with rotation.
  useMotionValueEvent(position, "change", (p) => {
    if (len <= 0) return;
    const wrapped = ((Math.round(p) % len) + len) % len;
    setCenter((c) => (c === wrapped ? c : wrapped));
  });

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const snapTo = (targetInt: number) => {
    snapTarget.current = targetInt;
    animate(position, targetInt, {
      type: "spring",
      stiffness: 280,
      damping: 36,
    });
  };

  // Keyboard: ← → step between donuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          (el instanceof HTMLElement && el.isContentEditable))
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        playTap(480);
        snapTo(snapTarget.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        playTap(440);
        snapTo(snapTarget.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPanStart = () => {
    dragStartPos.current = position.get();
    snapTarget.current = Math.round(position.get());
    setDragging(true);
  };

  const onPan = (_: unknown, info: PanInfo) => {
    position.set(dragStartPos.current - info.offset.x / PX_PER_DONUT);
  };

  const onPanEnd = (_: unknown, info: PanInfo) => {
    const currentPos = position.get();
    const travel = -info.velocity.x / PX_PER_DONUT;
    const projected = currentPos + travel * 0.15;

    // Trigger dynamic swipe whoosh audio
    const speedRatio = Math.min(
      2.5,
      Math.max(0.6, Math.abs(info.velocity.x) / 300),
    );
    if (Math.abs(info.velocity.x) > 120) {
      playSwipe(speedRatio);
    }

    let target: number;
    if (Math.abs(info.velocity.x) > 250) {
      target = Math.round(projected);
      if (travel > 0) target = Math.max(target, Math.floor(currentPos) + 1);
      else target = Math.min(target, Math.ceil(currentPos) - 1);
    } else {
      target = Math.round(currentPos);
    }
    target = clamp(
      target,
      Math.ceil(currentPos) - 2,
      Math.floor(currentPos) + 2,
    );

    snapTo(target);
    setDragging(false);
  };

  const centerThis = (index: number) => {
    if (len <= 0) return;
    playTap(520);
    const current = snapTarget.current;
    let delta = index - (((current % len) + len) % len);
    if (delta > len / 2) delta -= len;
    if (delta < -len / 2) delta += len;
    snapTo(current + delta);
  };

  const openCurrentDetail = () => {
    if (dragging) return;
    playTap(560);
    setDetailOpen(true);
  };

  if (loadingDonuts && allDonuts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-[var(--color-dowgnut-blue)]">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm font-medium">Loading dowgs…</p>
      </div>
    );
  }

  if (donutsError && allDonuts.length === 0) {
    return (
      <div
        role="alert"
        className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 p-10 text-center"
      >
        <h2 className="graffiti-text text-2xl text-[var(--color-dowgnut-blue-dark)]">
          We couldn&apos;t load the donuts
        </h2>
        <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/70">
          Check your connection, then try again. Your cart has not been changed.
        </p>
        <button
          type="button"
          onClick={() => void loadDonuts()}
          className="min-h-11 rounded-full bg-[var(--color-dowgnut-pink-dark)] px-6 font-bold text-white shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-blue-dark)] focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (len === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <img
          src="/brand/dohnut-mascot.png"
          alt=""
          className="h-24 w-24 animate-float object-contain"
        />
        <h3 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
          No dowgs here yet
        </h3>
        <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/70">
          We&apos;re baking fresh — check back in a sec.
        </p>
      </div>
    );
  }

  const current = donuts[center];
  if (!current) return null;

  const currentLayoutId =
    filterType && filterType !== "all"
      ? `category-donut-${filterType}`
      : `slider-donut-${current.id}`;
  const fav = favorites.some((f) => f.donutId === current.id);

  const onFav = async () => {
    playFavorite();
    const wasFav = favorites.some((f) => f.donutId === current.id);
    await toggleFavorite(current.id);
    toast({
      title: wasFav ? "Removed from favorites" : "Saved to favorites 💖",
      description: current.name,
    });
  };

  const onAdd = async () => {
    try {
      // Trigger Fly-to-Cart parabolic animation and harmonic chime
      const cartBtn = document.getElementById("dohnut-cart-btn");
      const cartRect = cartBtn?.getBoundingClientRect();
      const startX =
        typeof window !== "undefined" ? window.innerWidth / 2 : 200;
      const startY =
        typeof window !== "undefined" ? window.innerHeight * 0.42 : 300;
      const targetX = cartRect
        ? cartRect.left + cartRect.width / 2
        : typeof window !== "undefined"
          ? window.innerWidth - 45
          : 350;
      const targetY = cartRect ? cartRect.top + cartRect.height / 2 : 28;

      const flyId = `${Date.now()}-${Math.random()}`;
      setFlyingItems((prev) => [
        ...prev,
        { id: flyId, startX, startY, targetX, targetY, imgUrl: current.imgUrl },
      ]);

      playAddToCart();

      await addToCart(current.id, qty);
      setAdded(true);
      if (addedTimer.current) clearTimeout(addedTimer.current);
      addedTimer.current = setTimeout(() => setAdded(false), 1400);
      toast({
        title: "Added to cart! 🛒",
        description: `${current.name} × ${qty}`,
      });
    } catch {
      toast({
        title: "Couldn't add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-2">
      {/* Parabolic Fly-to-Cart Clones */}
      {flyingItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            position: "fixed",
            left: item.startX,
            top: item.startY,
            x: "-50%",
            y: "-50%",
            scale: 0.95,
            opacity: 1,
            rotate: 0,
            zIndex: 9999,
            pointerEvents: "none",
          }}
          animate={{
            left: item.targetX,
            top: item.targetY,
            scale: [0.95, 1.25, 0.25],
            opacity: [1, 1, 0.7],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 0.58,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={() => {
            setFlyingItems((prev) => prev.filter((f) => f.id !== item.id));
          }}
        >
          <img
            src={item.imgUrl}
            alt=""
            className="size-20 object-contain drop-shadow-2xl"
          />
        </motion.div>
      ))}

      <motion.button
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        onClick={() => {
          playTap(380);
          if (detailOpen) {
            setDetailOpen(false);
          } else {
            setView("shop");
          }
        }}
        className="mb-1 inline-flex size-9 items-center justify-center rounded-full text-[var(--color-dowgnut-blue-dark)]/60 hover:bg-white/80 hover:text-[var(--color-dowgnut-blue-dark)] shadow-sm backdrop-blur-sm cursor-pointer transition-colors"
        aria-label={detailOpen ? "Back to donut slider" : "Back to home"}
      >
        <ArrowLeft className="size-5" />
      </motion.button>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* 3D ring & info card */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            detailOpen && "pointer-events-none",
          )}
        >
          {/* 3D ring — it remains mounted while the selected donut travels to detail. */}
          <motion.div
            className="relative min-h-[min(38vh,220px)] w-full flex-1 overflow-visible cursor-grab touch-pan-y active:cursor-grabbing sm:min-h-[min(60vh,320px)]"
            style={{ perspective: "1600px" }}
            onPanStart={onPanStart}
            onPan={onPan}
            onPanEnd={onPanEnd}
            role="group"
            aria-label="Donut carousel"
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", rotateX: TILT }}
            >
              {donuts.map((donut, i) => (
                <RingCard
                  key={donut.id}
                  donut={donut}
                  index={i}
                  position={position}
                  len={len}
                  isCenter={i === center}
                  dragging={dragging}
                  onCenter={() => centerThis(i)}
                  onSelect={openCurrentDetail}
                  categoryLayoutId={
                    i === center
                      ? currentLayoutId
                      : undefined
                  }
                  detailOpen={detailOpen}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Active donut info — fixed panel; only the flavor content changes */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{
              opacity: detailOpen ? 0 : 1,
              y: detailOpen ? 20 : 0,
            }}
            transition={{ duration: 0.65, delay: 0.75, ease: [0.37, 0, 0.63, 1] }}
            className={cn(
              "relative z-10 -mt-12 flex w-full -translate-y-8 flex-col items-center gap-1.5 rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-white/85 px-3 pb-6 pt-5 text-center shadow-lg backdrop-blur-md sm:-mt-6 sm:translate-y-0 sm:px-4 sm:pt-6",
              detailOpen && "pointer-events-none"
            )}
          >
            <h2
              aria-live="polite"
              className="text-base font-black leading-tight text-[var(--color-dowgnut-blue-dark)] sm:text-lg"
            >
              {current.name}{" "}
              <span className="inline-flex items-center gap-0.5 text-xs font-black text-[var(--color-dowgnut-blue-dark)]">
                <span className="text-amber-500">★</span>
                {current.rating.toFixed(1)}
              </span>
            </h2>
            <p className="text-[11px] font-medium text-[var(--color-dowgnut-blue-dark)]/55">
              {current.calories} kcal · {current.sugar}g sugar · {current.fat}g fat
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-black tabular-nums text-[var(--color-dowgnut-blue-dark)]">
                RM {(current.price * qty).toFixed(2)}
              </span>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.8 }}
                onClick={onFav}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white cursor-pointer",
                  fav
                    ? "text-[var(--color-dowgnut-pink)]"
                    : "text-[var(--color-dowgnut-blue-dark)]/30",
                )}
                aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={fav}
              >
                <motion.div
                  animate={{ scale: fav ? [1, 1.35, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={cn("size-5", fav && "fill-current")} />
                </motion.div>
              </motion.button>
              <div className="inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15 bg-white/50 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    playTap(380);
                    setQty((q) => Math.max(1, q - 1));
                  }}
                  className="inline-flex size-11 items-center justify-center rounded-l-full active:scale-90 transition-transform cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <div className="relative h-6 w-8 overflow-hidden flex items-center justify-center select-none">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={qty}
                      initial={{ y: 12, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -12, opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      className="absolute text-sm font-black tabular-nums text-[var(--color-dowgnut-blue-dark)]"
                    >
                      {qty}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  disabled={qty >= current.stock}
                  onClick={() => {
                    playTap(440 + Math.min(10, qty) * 20);
                    setQty((q) => (current.stock > 0 ? Math.min(current.stock, q + 1) : q + 1));
                  }}
                  className="inline-flex size-11 items-center justify-center rounded-r-full active:scale-90 transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onAdd}
              disabled={current.stock <= 0}
              className={cn(
                "inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                added
                  ? "bg-emerald-500 shadow-emerald-500/30"
                  : "bg-[var(--color-dowgnut-pink)] shadow-[var(--color-dowgnut-pink)]/25 hover:brightness-105"
              )}
            >
              {added ? (
                <>
                  <Check className="size-4 animate-bounce" />
                  <span>Added!</span>
                </>
              ) : current.stock <= 0 ? (
                "Sold out"
              ) : (
                "Add to Cart"
              )}
            </motion.button>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/60">
              {filterType && filterType !== "all" ? `${filterType} · ` : ""}
              {`${center + 1}/${len} · swipe or ← → to explore`}
            </p>

            {/* Interactive Dough Dots Pagination Track */}
            <div className="flex items-center justify-center gap-1.5 mt-1 pb-0.5">
              {donuts.map((d, i) => (
                <motion.button
                  key={d.id}
                  type="button"
                  onClick={() => centerThis(i)}
                  aria-label={`Go to ${d.name}`}
                  className="relative h-2 rounded-full cursor-pointer transition-colors py-3 -my-3 bg-clip-content"
                  animate={{
                    width: i === center ? 20 : 6,
                    backgroundColor:
                      i === center
                        ? "var(--color-dowgnut-pink)"
                        : "rgba(7, 51, 79, 0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {detailOpen && (
          <div
            key={`detail-${current.id}`}
            className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden pointer-events-auto"
          >
            <div className="grid min-h-[min(58vh,430px)] grid-cols-[44%_56%] items-center overflow-hidden px-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.75, delay: 0.4, ease: [0.37, 0, 0.63, 1] }}
                className="z-10 flex flex-col gap-2 pl-1 text-left"
              >
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.45 }}
                  className="text-lg font-black leading-tight text-[var(--color-dowgnut-blue-dark)]"
                >
                  {current.name}
                </motion.h2>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-black text-amber-950">
                    ★ {current.rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-dowgnut-blue-dark)]/50">
                    · {current.stock} in stock
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {[
                    { label: "Salt", value: "Not listed", dot: "bg-sky-400" },
                    { label: "Sugar", value: `${current.sugar}g`, dot: "bg-amber-400" },
                    { label: "Fat", value: `${current.fat}g`, dot: "bg-rose-400" },
                    { label: "Energy", value: `${current.calories} kcal`, dot: "bg-orange-500" },
                  ].map(({ label, value, dot }, idx) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -24, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -16, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 24,
                        delay: 0.35 + idx * 0.06,
                      }}
                      whileHover={{ scale: 1.03, x: 2 }}
                      className="flex items-center justify-between rounded-full bg-white/90 px-3 py-1.5 text-[10px] shadow-sm backdrop-blur-sm border border-black/5"
                    >
                      <span className="inline-flex items-center gap-1.5 font-bold text-[var(--color-dowgnut-blue-dark)]/70">
                        <span className={cn("size-1.5 rounded-full shadow-xs", dot)} />
                        {label}
                      </span>
                      <span className="font-black text-[var(--color-dowgnut-blue-dark)]">
                        {value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <div className="relative -mr-24 flex h-full items-center justify-start sm:-mr-32 overflow-visible">
                <motion.img
                  layoutId={currentLayoutId}
                  src={current.imgUrl}
                  alt={current.name}
                  className="size-[min(94vw,400px)] max-w-none object-contain drop-shadow-2xl select-none [mask-image:linear-gradient(to_right,black_86%,transparent_100%)]"
                  draggable={false}
                  animate={{ rotate: 720 }}
                  transition={{
                    layout: { duration: 2.2, ease: [0.16, 1, 0.3, 1] },
                    rotate: { duration: 2.2, ease: [0.16, 1, 0.3, 1] },
                  }}
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.37, 0, 0.63, 1] }}
              className="mt-3 flex items-center justify-between rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-white/85 p-3 shadow-lg backdrop-blur-md"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/55">
                  Total
                </span>
                <div className="text-xl font-black tabular-nums text-[var(--color-dowgnut-blue-dark)]">
                  RM {(current.price * qty).toFixed(2)}
                </div>
              </div>
              <div className="inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15 bg-white/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    playTap(380);
                    setQty((q) => Math.max(1, q - 1));
                  }}
                  className="size-10 text-lg font-black active:scale-90 transition-transform cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="relative h-6 w-8 overflow-hidden flex items-center justify-center select-none">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={qty}
                      initial={{ y: 12, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -12, opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      className="absolute text-sm font-black tabular-nums text-[var(--color-dowgnut-blue-dark)]"
                    >
                      {qty}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  disabled={qty >= current.stock}
                  onClick={() => {
                    playTap(440 + Math.min(10, qty) * 20);
                    setQty((q) => (current.stock > 0 ? Math.min(current.stock, q + 1) : q + 1));
                  }}
                  className="size-10 text-lg font-black active:scale-90 transition-transform cursor-pointer disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onAdd}
              disabled={current.stock <= 0}
              className={cn(
                "mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50",
                added
                  ? "bg-emerald-500 shadow-emerald-500/30"
                  : "bg-[var(--color-dowgnut-pink)] shadow-[var(--color-dowgnut-pink)]/25 hover:brightness-105"
              )}
            >
              {added ? (
                <>
                  <Check className="size-4 animate-bounce" />
                  <span>Added to Cart!</span>
                </>
              ) : current.stock <= 0 ? (
                "Sold out"
              ) : (
                "Add to Cart"
              )}
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}

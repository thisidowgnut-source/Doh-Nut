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
      <motion.img
        src={donut.imgUrl}
        alt={donut.name}
        layoutId={isCenter ? categoryLayoutId ?? `slider-donut-${donut.id}` : undefined}
        loading={isCenter ? "eager" : "lazy"}
        fetchPriority={isCenter ? "high" : "auto"}
        className="size-56 object-contain sm:size-80 drop-shadow-xl select-none"
        draggable={false}
      />
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
      animate(position, 0, { type: "spring", stiffness: 320, damping: 32 });
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
      stiffness: 320,
      damping: 32,
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
        onClick={() => {
          playTap(380);
          if (detailOpen) {
            setDetailOpen(false);
          } else {
            setFilterType("all");
            setView("shop");
          }
        }}
        className="mb-1 inline-flex size-9 items-center justify-center rounded-full text-[var(--color-dowgnut-blue-dark)]/60 hover:bg-white/80 hover:text-[var(--color-dowgnut-blue-dark)] shadow-sm backdrop-blur-sm cursor-pointer transition-colors"
        aria-label={detailOpen ? "Back to donut slider" : "Back to home"}
      >
        <ArrowLeft className="size-5" />
      </motion.button>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <motion.div
          animate={{ opacity: detailOpen ? 0 : 1 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            detailOpen && "pointer-events-none",
          )}
        >
          {/* 3D ring — it remains mounted while the selected donut travels to detail. */}
          <motion.div
            className="relative min-h-[min(38vh,220px)] w-full flex-1 overflow-hidden cursor-grab touch-pan-y active:cursor-grabbing sm:min-h-[min(60vh,320px)]"
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
                    i === center &&
                    filterType &&
                    filterType !== "all"
                      ? `category-donut-${filterType}`
                      : undefined
                  }
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Active donut info — fixed panel; only the flavor content changes */}
          <div className="relative z-10 -mt-12 flex w-full -translate-y-8 flex-col items-center gap-1.5 rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-white/85 px-3 pb-6 pt-5 text-center shadow-lg backdrop-blur-md sm:-mt-6 sm:translate-y-0 sm:px-4 sm:pt-6">
            <h2
              aria-live="polite"
              className="text-base font-black leading-tight text-[var(--color-dowgnut-blue-dark)] sm:text-lg"
            >
              {current.name}{" "}
              <span className="text-xs font-semibold text-[var(--color-dowgnut-blue-dark)]/45">
                ★{current.rating.toFixed(1)}
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
                <Heart className={cn("size-5", fav && "fill-current")} />
              </motion.button>
              <div className="inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15 bg-white/50 shadow-inner">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="inline-flex size-11 items-center justify-center rounded-l-full"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-extrabold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="inline-flex size-11 items-center justify-center rounded-r-full"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onAdd}
              disabled={current.stock <= 0}
              className="inline-flex h-11 min-w-44 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] px-6 text-sm font-bold text-white shadow-md disabled:opacity-50"
            >
              {current.stock <= 0 ? "Sold out" : "Add to Cart"}
            </button>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-dowgnut-blue-dark)]/40">
              {filterType && filterType !== "all" ? `${filterType} · ` : ""}
              {`${center + 1}/${len} · swipe or ← → to explore`}
            </p>
          </div>
        </motion.div>

        {detailOpen && (
          <motion.div
            key={`detail-${current.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-20 flex min-h-0 flex-col overflow-hidden"
          >
            <div className="grid min-h-[min(58vh,430px)] grid-cols-[42%_58%] items-center overflow-hidden px-2">
              <div className="z-10 flex flex-col gap-2 pl-1 text-left">
                <h2 className="text-lg font-black leading-tight text-[var(--color-dowgnut-blue-dark)]">
                  {current.name}
                </h2>
                <p className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]/55">
                  ★{current.rating.toFixed(1)} · {current.stock} in stock
                </p>
                <div className="mt-2 space-y-2">
                  {[
                    ["Salt", "Not listed"],
                    ["Sugar", `${current.sugar}g`],
                    ["Fat", `${current.fat}g`],
                    ["Energy", `${current.calories} kcal`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] shadow-sm"
                    >
                      <span className="font-bold text-[var(--color-dowgnut-blue-dark)]/65">
                        {label}
                      </span>{" "}
                      <span className="font-black text-[var(--color-dowgnut-blue-dark)]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative -mr-20 flex h-full items-center justify-start sm:-mr-28">
                <motion.img
                  layoutId={currentLayoutId}
                  src={current.imgUrl}
                  alt={current.name}
                  className="size-[min(92vw,390px)] max-w-none object-contain drop-shadow-2xl"
                  draggable={false}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    layout: { duration: 1.45, ease: [0.22, 1, 0.36, 1] },
                    rotate: { duration: 1.45, ease: [0.22, 1, 0.36, 1] },
                  }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-white/85 p-3 shadow-lg">
              <div>
                <span className="text-[10px] font-bold uppercase text-[var(--color-dowgnut-blue-dark)]/55">
                  Total
                </span>
                <div className="text-xl font-black text-[var(--color-dowgnut-blue-dark)]">
                  RM {(current.price * qty).toFixed(2)}
                </div>
              </div>
              <div className="inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15 bg-white/60">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="size-10 text-lg font-black"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-7 text-center text-sm font-black">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="size-10 text-lg font-black"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onAdd}
              disabled={current.stock <= 0}
              className="mt-2 h-11 w-full rounded-full bg-[var(--color-dowgnut-pink)] text-sm font-bold text-white shadow-md disabled:opacity-50"
            >
              {current.stock <= 0 ? "Sold out" : "Add to Cart"}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

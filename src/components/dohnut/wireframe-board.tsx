"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  Columns3,
  LayoutGrid,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  X,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  ShoppingCart,
  Menu,
  Truck,
  CreditCard,
  ShieldCheck,
  Check,
  Search,
  Flame,
  Star,
  ExternalLink,
} from "lucide-react";
import {
  playTap,
  playAddToCart,
  playFavorite,
  playSwipe,
  isSoundEnabled,
  setSoundEnabled,
} from "@/lib/sounds";

export type ScreenId =
  | "home"
  | "slider"
  | "detail"
  | "saved"
  | "cart"
  | "checkout"
  | "orders"
  | "concierge";

type ViewMode = "device" | "flow" | "matrix";

interface ScreenMeta {
  id: ScreenId;
  label: string;
  badge: string;
  summary: string;
  sourceFile: string;
  specs: {
    intent: string;
    components: string[];
    interaction: string;
    soundHaptic: string;
    accessibility: string;
  };
}

const SCREENS: ScreenMeta[] = [
  {
    id: "home",
    label: "1. Home (ShopHome)",
    badge: "3-Donut Showcase",
    summary: "Visual 3-donut showcase (Classic, Sprinkled, Stuffed) with 'WHAT'S YOUR FLAVA?' header, floating sprinkles, and tap-to-slider spring transition.",
    sourceFile: "src/components/dohnut/shop-home.tsx",
    specs: {
      intent: "Showcase signature donut varieties with maximum tactile appeal and zero clutter.",
      components: ["DohnutHeader", "ShopHome", "ParticleBackground", "BottomNav"],
      interaction: "Tap any of the 3 layered donuts (Classic, Sprinkled, Stuffed) to trigger 360° spin & slide into 3D Ring Slider.",
      soundHaptic: "playTap(520 + i * 80) on donut select; playSwipe() on drag.",
      accessibility: "Semantic h1 in graffiti font, aria-label on donut buttons, WCAG AA contrast.",
    },
  },
  {
    id: "slider",
    label: "2. 3D Ring Slider",
    badge: "Ring Orbit (DonutSlider)",
    summary: "Curved 3D ring slider with ring perspective tilt, swipe inertia, active donut card, favorite heart, and Add to Cart.",
    sourceFile: "src/components/dohnut/donut-slider.tsx",
    specs: {
      intent: "Interactive 3D carousel allowing users to browse through catalog flavors within the selected category.",
      components: ["DonutSlider", "RingCard", "BottomNav", "FlyToCartClone"],
      interaction: "Horizontal pan rotates orbital ring; tap center donut to open Half-Donut Detail split screen.",
      soundHaptic: "playSwipe(speedRatio) on pan flick; playAddToCart() tri-tone chime on 'Add to Cart'.",
      accessibility: "Stock ceiling guard (disables button when stock <= 0), live region for flavor changes.",
    },
  },
  {
    id: "detail",
    label: "3. Half-Donut Detail",
    badge: "Split-Screen (42% / 58%)",
    summary: "Iconic split-screen layout with left-hand nutrition facts (Salt, Sugar, Fat, Energy) and massive right-hand half-donut bleed.",
    sourceFile: "src/components/dohnut/donut-slider.tsx (detailOpen)",
    specs: {
      intent: "Nutritional transparency and hyper-detailed macro view without leaving the slider context.",
      components: ["DonutSlider (Detail View)", "MacroNutritionPills", "HalfDonutHero"],
      interaction: "Tap ArrowLeft back button to return to 3D ring; adjust stepper (- 1 +); tap Add to Cart.",
      soundHaptic: "playTap(380) on back; playAddToCart() on confirm.",
      accessibility: "Clear unit labels for calories and grams, keyboard Esc handler to close.",
    },
  },
  {
    id: "saved",
    label: "4. Saved (FavoritesView)",
    badge: "Wishlist & Likes",
    summary: "Customer's bookmarked flavors with quick-add actions and the signature 'DOH MY GOSH!' mascot empty state.",
    sourceFile: "src/components/dohnut/favorites-view.tsx",
    specs: {
      intent: "Retain customer interest and allow quick re-ordering of favorite flavors.",
      components: ["FavoritesView", "DonutCard", "DohnutMascot", "BottomNav"],
      interaction: "Tap heart to toggle favorite status; tap '+ Add to Box' to add directly to cart.",
      soundHaptic: "playFavorite() soft pop; playAddToCart() on quick add.",
      accessibility: "Persistent active tab indicator on 'Saved' tab in bottom navigation.",
    },
  },
  {
    id: "cart",
    label: "5. Cart Drawer (Your Box)",
    badge: "Bottom Sheet / Side Panel",
    summary: "Slide-up cart drawer featuring Free Delivery progress meter (RM 25.00 min), voucher input, and safe-area checkout button.",
    sourceFile: "src/components/dohnut/cart-drawer.tsx",
    specs: {
      intent: "Review selected box contents, unlock free shipping incentive, and initiate checkout.",
      components: ["CartDrawer", "FreeDeliveryMeter", "VoucherField", "SafeBottomBar"],
      interaction: "Drag pill handle or tap X to dismiss; adjust item quantities; enter promo code; Proceed to Checkout.",
      soundHaptic: "playSwipe() on sheet open; playTap(600) on proceed to checkout.",
      accessibility: "Safe-area inset bottom padding pb-[calc(env(safe-area-inset-bottom)+0.75rem)].",
    },
  },
  {
    id: "checkout",
    label: "6. Express Checkout",
    badge: "Quick-Fill & Billplz",
    summary: "Streamlined checkout form with '⚡ Test Buyer' and '⭐ VIP Foodie' quick-fill presets and Billplz FPX / TNG payments.",
    sourceFile: "src/components/dohnut/checkout-view.tsx",
    specs: {
      intent: "Fast single-page order completion with zero friction.",
      components: ["CheckoutView", "QuickFillPills", "PaymentRadioGroup", "SSLBadge"],
      interaction: "Tap 1-click Quick-Fill pills; select payment gateway (Billplz / TNG / DuitNow); click Place Order.",
      soundHaptic: "playTap(520) on quick fill; playAddToCart() on payment submit.",
      accessibility: "Field-level validation, session-scoped payment initiation.",
    },
  },
  {
    id: "orders",
    label: "7. Order Tracking",
    badge: "5-Stage Stepper",
    summary: "Real-time order tracker with 5-stage progress (Paid ➔ Prep ➔ Baking ➔ Transit ➔ Arrived), ETA countdown, and rider contact card.",
    sourceFile: "src/components/dohnut/order-tracking-view.tsx",
    specs: {
      intent: "Live fulfilment feedback, reducing delivery anxiety with clear visual stages.",
      components: ["OrderTrackingView", "StatusStepper", "DeliveryRiderCard", "OrderReceipt"],
      interaction: "Status stepper auto-updates; direct Call & WhatsApp buttons to reach rider.",
      soundHaptic: "playTone(880Hz) chime on arrival at each status stage.",
      accessibility: "Live region aria-live='polite' for real-time status updates.",
    },
  },
  {
    id: "concierge",
    label: "8. AI Concierge (DOH BOY™)",
    badge: "Flava Assistant",
    summary: "DOH BOY™ AI flavor concierge modal accessible via header sparkles with quick craving pills and flavor pairings.",
    sourceFile: "src/components/dohnut/ai-concierge.tsx",
    specs: {
      intent: "Guide undecided customers to their ideal donut pairing based on mood and taste preference.",
      components: ["AiConcierge", "SuggestionPills", "ChatBubbles", "RecommendedCard"],
      interaction: "Tap craving suggestion pills; chat with AI assistant; tap '+ Box' to add recommendation.",
      soundHaptic: "Subtle 680Hz message tone; tap sound on recommendation selection.",
      accessibility: "Accessible dialog overlay, focus trap, and keyboard navigation.",
    },
  },
];

// -------------------------------------------------------------
// DOH-NUT 100% AUTHENTIC HEADER WIREFRAME (dohnut-header.tsx)
// -------------------------------------------------------------
function DohNutHeaderWireframe({
  onNavigate,
  cartCount = 2,
}: {
  onNavigate: (id: ScreenId) => void;
  cartCount?: number;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur-md">
      {/* Left: Doh-Nut Brand Logo */}
      <button
        type="button"
        onClick={() => {
          playTap(480);
          onNavigate("home");
        }}
        className="flex items-center gap-2 cursor-pointer"
        aria-label="Doh-Nut home"
      >
        <div className="flex size-8 items-center justify-center rounded-xl bg-[#1D3557] text-white shadow-sm font-black text-xs">
          DN
        </div>
        <div className="flex flex-col text-left">
          <span className="font-black text-xs tracking-tight text-[#1D3557]">DOH-NUT</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-[#EF233C]">
            KL Handcrafted
          </span>
        </div>
      </button>

      {/* Right Actions: Cart, AI Sparkles, Menu */}
      <div className="flex items-center gap-1.5">
        {/* Pink Cart Button with Count Badge */}
        <button
          type="button"
          onClick={() => {
            playTap(520);
            onNavigate("cart");
          }}
          className="relative flex size-9 items-center justify-center rounded-full bg-[#EF233C] text-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
          aria-label="Open cart"
        >
          <ShoppingCart className="size-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#FDE047] text-[9px] font-black text-[#1D3557] ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </button>

        {/* AI Concierge Sparkles Button */}
        <button
          type="button"
          onClick={() => {
            playTap(600);
            onNavigate("concierge");
          }}
          className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-[#1D3557] hover:bg-zinc-200 transition-colors cursor-pointer"
          aria-label="Open AI Concierge"
          title="DOH BOY™ AI Concierge"
        >
          <Sparkles className="size-4 text-[#EF233C]" />
        </button>

        {/* Menu Hamburger */}
        <button
          type="button"
          onClick={() => {
            playTap(440);
            onNavigate("saved");
          }}
          className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>
      </div>
    </header>
  );
}

// -------------------------------------------------------------
// DOH-NUT 100% AUTHENTIC 4-ITEM BOTTOM NAV (bottom-nav.tsx)
// -------------------------------------------------------------
function DohNutBottomNavWireframe({
  activeTab,
  onNavigate,
  cartCount = 2,
  favCount = 1,
}: {
  activeTab: "shop" | "favorites" | "cart" | "orders";
  onNavigate: (id: ScreenId) => void;
  cartCount?: number;
  favCount?: number;
}) {
  const items = [
    {
      key: "shop" as const,
      label: "Shop",
      icon: <ShoppingBag className="size-4" />,
      onClick: () => onNavigate("home"),
    },
    {
      key: "favorites" as const,
      label: "Saved",
      icon: <Heart className="size-4" />,
      badge: favCount > 0 ? favCount : undefined,
      onClick: () => onNavigate("saved"),
    },
    {
      key: "cart" as const,
      label: "Cart",
      icon: <ShoppingCart className="size-4" />,
      badge: cartCount > 0 ? cartCount : undefined,
      onClick: () => onNavigate("cart"),
    },
    {
      key: "orders" as const,
      label: "Orders",
      icon: <Truck className="size-4" />,
      onClick: () => onNavigate("orders"),
    },
  ];

  return (
    <nav className="border-t-2 border-[#1D3557]/15 bg-[#FFF9DB] px-3 py-1.5 shadow-[0_-4px_12px_rgba(29,53,87,0.08)]">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                playTap(500);
                item.onClick();
              }}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-2xl px-4 py-1 transition-all cursor-pointer",
                isActive
                  ? "bg-[#1D3557] text-[#FFF9DB] shadow-md scale-105 font-black"
                  : "text-[#1D3557]/70 hover:text-[#1D3557] font-bold",
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 flex size-3.5 items-center justify-center rounded-full bg-[#EF233C] text-[8px] font-black text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-[9px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// -------------------------------------------------------------
// DOH-NUT WIREFRAME DONUT GRAPHIC PRIMITIVE
// -------------------------------------------------------------
function WireframeClayDonut({
  flavor,
  desc,
  accent = "#EF233C",
  className,
}: {
  flavor: string;
  desc?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full border-[18px] text-center shadow-xl transition-transform",
        className,
      )}
      style={{ borderColor: accent, backgroundColor: "#FFF9DB" }}
    >
      {/* Decorative Sprinkles Pattern */}
      <div className="absolute inset-2 flex items-center justify-center pointer-events-none">
        <div className="absolute top-2 left-6 size-1.5 rounded-full bg-[#EF233C]" />
        <div className="absolute top-4 right-6 size-2 rounded-full bg-[#1D3557]" />
        <div className="absolute bottom-3 left-7 size-1.5 rounded-full bg-[#FDE047]" />
        <div className="absolute bottom-5 right-7 size-1 rounded-full bg-[#EF233C]" />
      </div>

      {/* Donut Hole */}
      <div className="size-10 rounded-full border-4 border-zinc-400/60 bg-white/90 shadow-inner" />

      {/* Label Overlay */}
      <div className="absolute inset-x-2 bottom-1 text-center pointer-events-none">
        <p className="line-clamp-1 text-[9px] font-black uppercase tracking-wider text-[#1D3557]">
          {flavor}
        </p>
        {desc && <p className="text-[7px] font-bold text-zinc-500">{desc}</p>}
      </div>
    </div>
  );
}

// =============================================================
// SCREEN 1: 100% AUTHENTIC HOME VIEW (shop-home.tsx)
// =============================================================
function AuthenticHomeScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  const homeDonutTypes = [
    {
      key: "classic",
      label: "Classic",
      desc: "Timeless glazed & cake",
      accent: "#92400E",
      tone: "border-[#92400E]",
    },
    {
      key: "sprinkled",
      label: "Sprinkled",
      desc: "Rainbow jimmies & fun",
      accent: "#BE185D",
      tone: "border-[#BE185D]",
    },
    {
      key: "stuffed",
      label: "Stuffed",
      desc: "Filled with cream & jelly",
      accent: "#1E40AF",
      tone: "border-[#1E40AF]",
    },
  ];

  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-[#FFF9DB]/40 select-none overflow-hidden">
      {/* Authentic Doh-Nut Header */}
      <DohNutHeaderWireframe onNavigate={onNavigate} />

      {/* Floating Sprinkles Background Emulation */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-8 size-2 rounded-full bg-[#EF233C]" />
        <div className="absolute top-36 right-10 size-2.5 rounded-full bg-[#1D3557]" />
        <div className="absolute bottom-28 left-12 size-2 rounded-full bg-[#FDE047]" />
        <div className="absolute bottom-40 right-14 size-2 rounded-full bg-[#EF233C]" />
      </div>

      {/* Headline: WHAT'S YOUR FLAVA? */}
      <div className="relative z-10 pt-3 text-center">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-[#1D3557] drop-shadow-xs">
          WHAT&apos;S YOUR FLAVA?
        </h1>
        {/* Streak Badge */}
        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EF233C]/10 px-3 py-0.5 shadow-xs">
          <span className="text-[10px] font-bold text-[#EF233C]">🔥 3 day streak</span>
        </div>
      </div>

      {/* 3 Big Showcase Display Donuts (-space-y-5 layout from shop-home.tsx) */}
      <main className="relative z-10 my-auto flex w-full flex-1 flex-col items-center justify-center -space-y-6 py-2">
        {homeDonutTypes.map((t, idx) => {
          const isTop = idx === 0;
          const isCenter = idx === 1;
          const isBottom = idx === 2;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                playTap(520 + idx * 80);
                onNavigate("slider");
              }}
              className={cn(
                "group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-200 hover:scale-105 active:scale-95",
                isTop ? "z-30" : isCenter ? "z-20" : "z-10",
              )}
              aria-label={`Browse ${t.label} donuts`}
            >
              {/* Ground Shadow */}
              <div className="absolute -bottom-1 h-4 w-44 rounded-full bg-black/15 blur-md pointer-events-none group-hover:scale-110 transition-transform" />

              <WireframeClayDonut
                flavor={t.label}
                desc={t.desc}
                accent={t.accent}
                className={cn(
                  "size-44 sm:size-48 border-[18px]",
                  isCenter ? "size-48 sm:size-52 ring-4 ring-[#1D3557]/15 shadow-2xl" : "opacity-95",
                )}
              />
            </button>
          );
        })}
      </main>

      {/* Helper text */}
      <div className="relative z-10 pb-2 text-center">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D3557]/50">
          Tap any donut to enter 3D orbital ring
        </p>
      </div>

      {/* 4-Item Bottom Nav */}
      <DohNutBottomNavWireframe activeTab="shop" onNavigate={onNavigate} />
    </div>
  );
}

// =============================================================
// SCREEN 2: 100% AUTHENTIC 3D RING SLIDER (donut-slider.tsx)
// =============================================================
function AuthenticSliderScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-[#FFF9DB]/40 select-none overflow-hidden">
      <DohNutHeaderWireframe onNavigate={onNavigate} />

      {/* Circular Back Arrow Button to Home */}
      <div className="px-4 pt-2">
        <button
          type="button"
          onClick={() => {
            playTap(380);
            onNavigate("home");
          }}
          className="inline-flex size-9 items-center justify-center rounded-full bg-white/80 text-[#1D3557] shadow-sm hover:bg-white cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>

      {/* 3D Ring Orbit Canvas */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-2">
        <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-3xl border border-[#1D3557]/10 bg-white/40 shadow-inner">
          {/* Orbital Ellipse Dashed Guide */}
          <div className="absolute inset-x-4 top-1/2 h-24 -translate-y-1/2 rounded-full border-2 border-dashed border-[#1D3557]/20" />

          {/* Left Angle Peripheral Donut */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 scale-75 opacity-50">
            <WireframeClayDonut flavor="Vanilla Bean" accent="#92400E" className="size-24 border-[10px]" />
          </div>

          {/* Center Focused Donut */}
          <button
            type="button"
            onClick={() => {
              playTap(560);
              onNavigate("detail");
            }}
            className="group relative z-10 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            aria-label="View Classic Glazed detail"
          >
            <div className="absolute -bottom-2 h-4 w-36 rounded-full bg-black/15 blur-sm" />
            <WireframeClayDonut
              flavor="Classic Glazed"
              desc="4.9★"
              accent="#92400E"
              className="size-44 border-[20px] shadow-2xl"
            />
            <span className="mt-2 rounded-full bg-white/90 border border-[#1D3557]/20 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#1D3557] shadow-sm">
              Tap Donut for Half-Split Details
            </span>
          </button>

          {/* Right Angle Peripheral Donut */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 scale-75 opacity-50">
            <WireframeClayDonut flavor="Matcha White" accent="#BE185D" className="size-24 border-[10px]" />
          </div>
        </div>

        {/* Active Donut Info Card (fixed panel from donut-slider.tsx) */}
        <div className="relative z-10 mt-2 flex w-full flex-col items-center rounded-3xl border-2 border-[#1D3557]/10 bg-white/90 p-4 text-center shadow-lg backdrop-blur-md">
          <h2 className="text-base font-black text-[#1D3557]">
            Classic Glazed{" "}
            <span className="text-xs font-semibold text-[#1D3557]/50">★4.9</span>
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-[#1D3557]/60">
            380 kcal · 18g sugar · 14g fat
          </p>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-base font-black text-[#1D3557]">
              RM {(4.2 * qty).toFixed(2)}
            </span>

            {/* Favorite Heart Button */}
            <button
              type="button"
              onClick={() => {
                playFavorite();
                setIsFav(!isFav);
              }}
              className="inline-flex size-9 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
              aria-label="Toggle favorite"
            >
              <Heart
                className={cn("size-4", isFav ? "fill-[#EF233C] text-[#EF233C]" : "text-[#1D3557]/40")}
              />
            </button>

            {/* Quantity Stepper */}
            <div className="inline-flex items-center rounded-full border border-[#1D3557]/15 bg-white/70 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  playTap(350);
                  setQty(Math.max(1, qty - 1));
                }}
                className="inline-flex size-8 items-center justify-center rounded-l-full cursor-pointer"
              >
                <Minus className="size-3" />
              </button>
              <span className="min-w-6 text-center text-xs font-black">{qty}</span>
              <button
                type="button"
                onClick={() => {
                  playTap(450);
                  setQty(qty + 1);
                }}
                className="inline-flex size-8 items-center justify-center rounded-r-full cursor-pointer"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>

          {/* Authentic Pink Add to Cart Button */}
          <button
            type="button"
            onClick={() => {
              playAddToCart();
              onNavigate("cart");
            }}
            className="mt-3 inline-flex h-10 w-full max-w-xs items-center justify-center rounded-full bg-[#EF233C] hover:bg-[#d81930] px-6 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-98 cursor-pointer transition-all"
          >
            Add to Cart
          </button>

          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-[#1D3557]/40">
            classic · 1/8 · swipe or ← → to explore
          </p>
        </div>
      </main>

      <DohNutBottomNavWireframe activeTab="shop" onNavigate={onNavigate} />
    </div>
  );
}

// =============================================================
// SCREEN 3: 100% AUTHENTIC HALF-DONUT DETAIL (donut-slider.tsx)
// =============================================================
function AuthenticDetailScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-[#FFF9DB]/40 select-none overflow-hidden">
      <DohNutHeaderWireframe onNavigate={onNavigate} />

      {/* Top Back Button to Return to Slider */}
      <div className="px-4 pt-2">
        <button
          type="button"
          onClick={() => {
            playTap(380);
            onNavigate("slider");
          }}
          className="inline-flex size-9 items-center justify-center rounded-full bg-white/80 text-[#1D3557] shadow-sm hover:bg-white cursor-pointer"
          aria-label="Back to slider"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>

      {/* Signature Split-Screen Grid: 42% left, 58% right */}
      <main className="flex flex-1 flex-col justify-center px-4 py-2">
        <div className="relative grid min-h-[300px] grid-cols-[44%_56%] items-center overflow-hidden rounded-3xl border border-[#1D3557]/10 bg-white/60 p-3 shadow-md">
          {/* Left Column (42%): Nutrition Pills */}
          <div className="z-10 flex flex-col gap-1.5 pl-1 text-left">
            <h2 className="text-base font-black leading-tight text-[#1D3557]">
              Classic Glazed
            </h2>
            <p className="text-[10px] font-bold text-[#1D3557]/55">
              ★4.9 · 18 in stock
            </p>

            <div className="mt-2 space-y-1.5">
              {[
                ["Salt", "Not listed"],
                ["Sugar", "18g"],
                ["Fat", "14g"],
                ["Energy", "380 kcal"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] shadow-xs border border-zinc-200"
                >
                  <span className="font-bold text-[#1D3557]/65">{label}</span>{" "}
                  <span className="font-black text-[#1D3557]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (58%): Massive Half-Donut Bleed */}
          <div className="relative -mr-16 flex h-full items-center justify-start overflow-visible">
            <div className="size-56 rounded-full border-[22px] border-[#92400E] bg-[#FFF9DB] shadow-2xl flex items-center justify-center">
              <div className="size-16 rounded-full border-4 border-zinc-400/60 bg-white/80 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Bottom Card: Total, Stepper, Add to Cart */}
        <div className="mt-3 rounded-3xl border-2 border-[#1D3557]/10 bg-white/90 p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase text-[#1D3557]/55">
                Total
              </span>
              <div className="text-lg font-black text-[#1D3557]">
                RM {(4.2 * qty).toFixed(2)}
              </div>
            </div>

            <div className="inline-flex items-center rounded-full border border-[#1D3557]/15 bg-white/70">
              <button
                type="button"
                onClick={() => {
                  playTap(350);
                  setQty(Math.max(1, qty - 1));
                }}
                className="size-9 text-base font-black cursor-pointer"
              >
                −
              </button>
              <span className="min-w-6 text-center text-xs font-black">{qty}</span>
              <button
                type="button"
                onClick={() => {
                  playTap(450);
                  setQty(qty + 1);
                }}
                className="size-9 text-base font-black cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playAddToCart();
              onNavigate("cart");
            }}
            className="mt-2.5 h-10 w-full rounded-full bg-[#EF233C] text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#d81930] cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </main>

      <DohNutBottomNavWireframe activeTab="shop" onNavigate={onNavigate} />
    </div>
  );
}

// =============================================================
// SCREEN 4: 100% AUTHENTIC SAVED / FAVORITES (favorites-view.tsx)
// =============================================================
function AuthenticSavedScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-[#FFF9DB]/40 select-none overflow-hidden">
      <DohNutHeaderWireframe onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="inline-flex size-8 items-center justify-center rounded-full bg-white text-[#1D3557] shadow-sm"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#EF233C]">
              Saved for later
            </p>
            <h1 className="text-xl font-black text-[#1D3557]">My Favorites</h1>
          </div>
        </div>

        {/* Saved Donut Cards */}
        <div className="space-y-2.5">
          {[
            { name: "Classic Glazed", price: "RM 4.20", kcal: "380 kcal", accent: "#92400E" },
            { name: "Strawberry Sparkle", price: "RM 4.80", kcal: "410 kcal", accent: "#BE185D" },
          ].map((donut) => (
            <div
              key={donut.name}
              className="flex items-center gap-3 rounded-2xl border border-[#1D3557]/10 bg-white/90 p-3 shadow-sm"
            >
              <WireframeClayDonut
                flavor={donut.name}
                accent={donut.accent}
                className="size-14 border-[6px] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-black text-[#1D3557] truncate">{donut.name}</h3>
                <p className="text-[10px] text-zinc-500">{donut.kcal} · {donut.price}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playAddToCart();
                  onNavigate("cart");
                }}
                className="rounded-full bg-[#EF233C] px-3 py-1 text-[9px] font-black uppercase text-white shadow-xs cursor-pointer"
              >
                + Box
              </button>
            </div>
          ))}
        </div>
      </main>

      <DohNutBottomNavWireframe activeTab="favorites" onNavigate={onNavigate} favCount={2} />
    </div>
  );
}

// =============================================================
// SCREEN 5: 100% AUTHENTIC CART DRAWER (cart-drawer.tsx)
// =============================================================
function AuthenticCartScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-black/40 select-none overflow-hidden">
      <div className="flex-1" onClick={() => onNavigate("slider")} />

      {/* Bottom Sheet Modal Container */}
      <div className="flex max-h-[85vh] w-full flex-col rounded-t-[32px] border-t border-[#1D3557]/15 bg-[#FFF9DB] p-0 shadow-2xl">
        {/* iOS-Style Pill Grab Handle */}
        <div className="flex w-full justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-black/20" />
        </div>

        {/* Sheet Header: Your Box */}
        <div className="border-b border-[#1D3557]/10 bg-white/80 px-5 pb-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#EF233C] text-white shadow-sm">
                <ShoppingBag className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1D3557]">Your Box</h3>
                <p className="text-[10px] font-bold text-[#1D3557]/50">
                  2 donuts selected
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("slider")}
              className="inline-flex size-7 items-center justify-center rounded-full bg-black/5 text-[#1D3557] hover:bg-black/10 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Free Delivery Meter */}
          <div className="mt-2 rounded-xl border border-[#1D3557]/10 bg-[#FFF9DB]/80 p-2 text-xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#1D3557]">
              <span className="flex items-center gap-1">
                <Truck className="size-3 text-[#EF233C]" />
                Add <strong className="text-[#EF233C]">RM 16.60</strong> for FREE delivery
              </span>
              <span className="text-[9px] text-[#1D3557]/50">34%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-black/10">
              <div className="h-1.5 w-1/3 rounded-full bg-[#EF233C]" />
            </div>
          </div>
        </div>

        {/* Box Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 max-h-[30vh]">
          {[
            { name: "Classic Glazed", price: "RM 4.20", qty: 1 },
            { name: "Strawberry Sparkle", price: "RM 4.80", qty: 1 },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-xl border border-[#1D3557]/10 bg-white p-2"
            >
              <WireframeClayDonut flavor={item.name} className="size-12 border-[5px] shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-[#1D3557] truncate">{item.name}</h4>
                <p className="text-[10px] font-bold text-zinc-500">{item.price}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-bold">
                <button type="button" onClick={() => playTap(350)}>
                  <Minus className="size-3" />
                </button>
                <span className="text-[10px] font-black">{item.qty}</span>
                <button type="button" onClick={() => playTap(450)}>
                  <Plus className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Voucher & Checkout CTA */}
        <div className="border-t border-[#1D3557]/10 bg-white p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <div className="flex justify-between text-xs text-zinc-600 mb-2">
            <span>Subtotal</span>
            <span className="font-bold text-[#1D3557]">RM 9.00</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playTap(600);
              onNavigate("checkout");
            }}
            className="w-full rounded-full bg-[#EF233C] hover:bg-[#d81930] py-3 text-center text-xs font-black uppercase tracking-wider text-white shadow-md cursor-pointer"
          >
            Checkout · RM 9.00
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// SCREEN 6: 100% AUTHENTIC CHECKOUT (checkout-view.tsx)
// =============================================================
function AuthenticCheckoutScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-[#FFF9DB]/30 select-none overflow-hidden">
      <DohNutHeaderWireframe onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("cart")}
            className="flex items-center gap-1 text-xs font-black text-[#1D3557]"
          >
            <ArrowLeft className="size-4" />
            <span>Cart</span>
          </button>
          <span className="text-xs font-black text-[#1D3557]">EXPRESS CHECKOUT</span>
          <span className="size-4" />
        </div>

        {/* Quick Fill Pills */}
        <div>
          <span className="block text-[8px] font-black uppercase text-zinc-500 mb-1">
            Quick Fill Presets
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => playTap(520)}
              className="rounded-full border border-[#1D3557]/20 bg-white px-3 py-1 text-[9px] font-black text-[#1D3557]"
            >
              ⚡ Test Buyer
            </button>
            <button
              type="button"
              onClick={() => playTap(520)}
              className="rounded-full border border-[#1D3557]/20 bg-white px-3 py-1 text-[9px] font-black text-[#1D3557]"
            >
              ⭐ VIP Foodie
            </button>
          </div>
        </div>

        {/* Customer Form Fields */}
        <div className="space-y-2">
          {[
            { label: "Name", val: "Ahmad Farhan" },
            { label: "Phone", val: "+60 12-345 6789" },
            { label: "Address", val: "Residensi Horizon, Bangsar, KL" },
          ].map((f) => (
            <div key={f.label}>
              <span className="block text-[8px] font-black uppercase text-zinc-500">{f.label}</span>
              <div className="h-8 rounded-xl border border-zinc-300 bg-white px-3 flex items-center text-xs font-bold text-[#1D3557]">
                {f.val}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Radio */}
        <div>
          <span className="block text-[8px] font-black uppercase text-zinc-500 mb-1">
            Payment Gateway
          </span>
          <div className="rounded-xl border border-zinc-200 bg-white p-2 text-xs font-bold text-[#1D3557] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="size-3.5 text-[#EF233C]" />
              <span>Billplz FPX (Online Banking)</span>
            </div>
            <Check className="size-3.5 text-emerald-600" />
          </div>
        </div>

        {/* SSL Badge */}
        <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-zinc-400">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          <span>256-bit SSL Encrypted Payment</span>
        </div>
      </main>

      <div className="border-t border-[#1D3557]/10 bg-white p-4">
        <button
          type="button"
          onClick={() => {
            playAddToCart();
            onNavigate("orders");
          }}
          className="w-full rounded-full bg-[#EF233C] py-3 text-center text-xs font-black uppercase text-white shadow-md cursor-pointer"
        >
          Pay & Place Order · RM 9.00
        </button>
      </div>
    </div>
  );
}

// =============================================================
// SCREEN 7: 100% AUTHENTIC ORDER TRACKING (order-tracking-view.tsx)
// =============================================================
function AuthenticOrdersScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-[#FFF9DB]/30 select-none overflow-hidden">
      <DohNutHeaderWireframe onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#1D3557]">Order #DN-1042</span>
          <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[8px] font-black uppercase">
            Baking
          </span>
        </div>

        {/* 5-Stage Stepper */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-3">
          <div className="relative flex items-center justify-between my-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-zinc-200" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-3/5 bg-[#1D3557]" />

            {[
              { label: "Paid", done: true },
              { label: "Prep", done: true },
              { label: "Baking", done: true, active: true },
              { label: "Transit", done: false },
              { label: "Arrived", done: false },
            ].map((st) => (
              <div key={st.label} className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    "size-4 rounded-full flex items-center justify-center text-[7px] font-bold",
                    st.active
                      ? "bg-[#1D3557] text-white ring-2 ring-zinc-300"
                      : st.done
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-200 text-zinc-500",
                  )}
                >
                  ✓
                </div>
                <span className="mt-1 text-[7px] font-bold text-zinc-600">{st.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center">
            <span className="text-[9px] font-bold text-zinc-400 uppercase">Estimated Delivery</span>
            <span className="block text-sm font-black text-[#1D3557]">In ~18 minutes</span>
          </div>
        </div>

        {/* Rider Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-zinc-200 flex items-center justify-center font-black text-[10px] text-[#1D3557]">
              RF
            </div>
            <div>
              <span className="block text-xs font-black text-[#1D3557]">Rider: Faris</span>
              <span className="text-[8px] text-zinc-500">Yamaha Y15 · 4.9★</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => playTap(520)}
            className="rounded-lg bg-[#1D3557] text-white px-2.5 py-1 text-[9px] font-bold"
          >
            Call
          </button>
        </div>
      </main>

      <DohNutBottomNavWireframe activeTab="orders" onNavigate={onNavigate} />
    </div>
  );
}

// =============================================================
// SCREEN 8: 100% AUTHENTIC AI CONCIERGE (ai-concierge.tsx)
// =============================================================
function AuthenticConciergeScreen({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  return (
    <div className="relative flex min-h-[640px] flex-col justify-between bg-[#FFF9DB]/40 select-none overflow-hidden">
      <DohNutHeaderWireframe onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div>
            <h3 className="text-xs font-black text-[#1D3557]">DOH BOY™ Concierge 🤖</h3>
            <p className="text-[9px] text-emerald-600 font-bold">Online & Ready to Pair</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="inline-flex size-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Suggestion Pills */}
        <div className="flex gap-1 overflow-x-auto py-1 [scrollbar-width:none]">
          {["Sweet & Savory?", "Low Calorie (<350)?", "Kids Party Pack"].map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => playTap(550)}
              className="whitespace-nowrap rounded-full border border-[#1D3557]/15 bg-white px-2.5 py-0.5 text-[8px] font-bold text-[#1D3557]"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Chat Message Pair */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-end">
            <div className="rounded-xl rounded-tr-none bg-[#1D3557] px-3 py-1.5 text-white text-[11px]">
              What pairs best with black coffee?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="rounded-xl rounded-tl-none border border-zinc-200 bg-white p-2.5 shadow-xs text-[11px] text-[#1D3557] max-w-[88%]">
              <p>Our <strong>Classic Glazed</strong> cuts through coffee bitterness perfectly!</p>
              <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-1.5">
                <span className="font-black text-[10px]">Classic Glazed · RM 4.20</span>
                <button
                  type="button"
                  onClick={() => {
                    playAddToCart();
                    onNavigate("cart");
                  }}
                  className="rounded-full bg-[#EF233C] px-2 py-0.5 text-[8px] font-black uppercase text-white"
                >
                  + Box
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DohNutBottomNavWireframe activeTab="shop" onNavigate={onNavigate} />
    </div>
  );
}

// =============================================================
// MAIN WIREFRAME BOARD EXPORT
// =============================================================
export function WireframeBoard() {
  const [active, setActive] = useState<ScreenId>("home");
  const [viewMode, setViewMode] = useState<ViewMode>("device");
  const [showSpecs, setShowSpecs] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playTap(660);
  };

  const activeMeta = SCREENS.find((s) => s.id === active) || SCREENS[0];

  const renderActiveScreen = (id: ScreenId) => {
    switch (id) {
      case "home":
        return <AuthenticHomeScreen onNavigate={setActive} />;
      case "slider":
        return <AuthenticSliderScreen onNavigate={setActive} />;
      case "detail":
        return <AuthenticDetailScreen onNavigate={setActive} />;
      case "saved":
        return <AuthenticSavedScreen onNavigate={setActive} />;
      case "cart":
        return <AuthenticCartScreen onNavigate={setActive} />;
      case "checkout":
        return <AuthenticCheckoutScreen onNavigate={setActive} />;
      case "orders":
        return <AuthenticOrdersScreen onNavigate={setActive} />;
      case "concierge":
        return <AuthenticConciergeScreen onNavigate={setActive} />;
      default:
        return <AuthenticHomeScreen onNavigate={setActive} />;
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF9DB]/30 p-3 sm:p-6 font-sans text-[#1D3557]">
      <div className="mx-auto max-w-7xl">
        {/* Top Control Bar */}
        <header className="mb-6 rounded-2xl border-2 border-[#1D3557]/15 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#EF233C] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                  100% REAL APP BLUEPRINT
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1D3557]/60">
                  DOH-NUT ARCHITECTURE
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1D3557]">
                Authentic Doh-Nut App Wireframe
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500">
                100% mematuhi konsep sebenar Doh-Nut: 3-Donut vertical stack, 3D Ring Slider, Split Half-Donut detail, dan 4-Item BottomNav.
              </p>
            </div>

            {/* View Mode & Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer",
                  soundOn
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-zinc-300 bg-zinc-100 text-zinc-500",
                )}
              >
                {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                <span>{soundOn ? "Sound ON" : "Muted"}</span>
              </button>

              {/* Dev Specs Toggle */}
              <button
                type="button"
                onClick={() => {
                  playTap(520);
                  setShowSpecs(!showSpecs);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer",
                  showSpecs
                    ? "border-[#1D3557] bg-[#1D3557] text-white"
                    : "border-zinc-300 bg-white text-[#1D3557]",
                )}
              >
                <Sparkles className="size-4 text-[#EF233C]" />
                <span>{showSpecs ? "Hide App Specs" : "Show App Specs"}</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex rounded-xl border border-[#1D3557]/20 bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setViewMode("device");
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                    viewMode === "device" ? "bg-white text-[#1D3557] shadow-sm font-black" : "text-zinc-500",
                  )}
                >
                  <Smartphone className="size-3.5" />
                  <span>Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setViewMode("flow");
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                    viewMode === "flow" ? "bg-white text-[#1D3557] shadow-sm font-black" : "text-zinc-500",
                  )}
                >
                  <Columns3 className="size-3.5" />
                  <span>Storyboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setViewMode("matrix");
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                    viewMode === "matrix" ? "bg-white text-[#1D3557] shadow-sm font-black" : "text-zinc-500",
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* Screen Pills Selector */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto pt-3 border-t border-zinc-200 [scrollbar-width:none]">
            {SCREENS.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => {
                  playTap(480);
                  setActive(screen.id);
                }}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  active === screen.id
                    ? "bg-[#1D3557] text-white shadow-sm"
                    : "bg-zinc-100 text-[#1D3557]/70 hover:bg-zinc-200",
                )}
              >
                {screen.label}
              </button>
            ))}
          </div>
        </header>

        {/* VIEW MODE 1: DEVICE VIEW */}
        {viewMode === "device" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(320px,390px)_1fr]">
            {/* Mobile Device Frame */}
            <div className="mx-auto w-full max-w-[390px]">
              <div className="overflow-hidden rounded-[44px] border-[10px] border-[#1D3557] bg-white shadow-[0_32px_64px_rgba(29,53,87,0.25)] ring-2 ring-[#EF233C]/30">
                {/* Dynamic Island / Speaker Notch */}
                <div className="relative bg-white pt-2.5 pb-1">
                  <div className="mx-auto h-5 w-24 rounded-full bg-[#1D3557] flex items-center justify-between px-2.5">
                    <div className="size-2 rounded-full bg-[#1D3557]" />
                    <div className="size-2 rounded-full bg-zinc-800" />
                  </div>
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 pt-1 text-[10px] font-black text-[#1D3557]">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px]">5G</span>
                      <div className="h-2 w-4 rounded-sm border border-[#1D3557] p-0.5">
                        <div className="h-full w-full bg-[#1D3557] rounded-2xs" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actual Screen Container */}
                <div className="min-h-[640px] max-h-[720px] overflow-y-auto bg-white">
                  {renderActiveScreen(active)}
                </div>

                {/* Bottom Home Indicator */}
                <div className="bg-[#FFF9DB] py-2 border-t border-[#1D3557]/10">
                  <div className="mx-auto h-1 w-32 rounded-full bg-[#1D3557]" />
                </div>
              </div>
            </div>

            {/* Screen Specifications & Ground Truth Ledger */}
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-[#1D3557]/15 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="rounded-full bg-[#EF233C]/10 text-[#EF233C] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                      {activeMeta.badge}
                    </span>
                    <h2 className="mt-2 text-xl font-black text-[#1D3557]">{activeMeta.label}</h2>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                    {activeMeta.sourceFile}
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                  {activeMeta.summary}
                </p>

                {showSpecs && (
                  <div className="mt-5 space-y-4 border-t border-zinc-200 pt-4 text-xs">
                    <div>
                      <strong className="block text-[10px] font-black uppercase tracking-wider text-[#1D3557] mb-1">
                        1. Konsep Asal & UX Intent
                      </strong>
                      <p className="text-zinc-600">{activeMeta.specs.intent}</p>
                    </div>

                    <div>
                      <strong className="block text-[10px] font-black uppercase tracking-wider text-[#1D3557] mb-1">
                        2. Komponen Asal Repositori
                      </strong>
                      <div className="flex flex-wrap gap-1.5">
                        {activeMeta.specs.components.map((c) => (
                          <span
                            key={c}
                            className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1D3557]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <strong className="block text-[10px] font-black uppercase tracking-wider text-[#1D3557] mb-1">
                        3. Fizik & Mekanisme Sentuhan
                      </strong>
                      <p className="text-zinc-600">{activeMeta.specs.interaction}</p>
                    </div>

                    <div>
                      <strong className="block text-[10px] font-black uppercase tracking-wider text-[#1D3557] mb-1">
                        4. Web Audio & Maklum Balas Haptik
                      </strong>
                      <p className="text-zinc-600">{activeMeta.specs.soundHaptic}</p>
                    </div>

                    <div>
                      <strong className="block text-[10px] font-black uppercase tracking-wider text-[#1D3557] mb-1">
                        5. Zon Selamat (Safe Area) & Aksesibiliti
                      </strong>
                      <p className="text-zinc-600">{activeMeta.specs.accessibility}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Shortcuts */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                  Laluan Aliran Pembelian (Flow Funnel)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCREENS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        playTap();
                        setActive(s.id);
                      }}
                      className={cn(
                        "rounded-xl border p-2 text-left text-[10px] font-black transition-all cursor-pointer",
                        active === s.id
                          ? "border-[#1D3557] bg-[#1D3557] text-white shadow-sm"
                          : "border-zinc-200 bg-zinc-50 text-[#1D3557] hover:bg-zinc-100",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: STORYBOARD FLOW */}
        {viewMode === "flow" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-600 font-bold">
              Storyboard Aliran Lengkap: Home (3-Donut) ➔ 3D Ring Slider ➔ Half-Donut Detail ➔ Cart Box ➔ Checkout ➔ Order Tracking.
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6">
              {(["home", "slider", "detail", "saved", "cart", "checkout", "orders"] as ScreenId[]).map(
                (screenId, idx) => {
                  const meta = SCREENS.find((s) => s.id === screenId)!;
                  return (
                    <div
                      key={screenId}
                      className="w-[340px] shrink-0 overflow-hidden rounded-[36px] border-[8px] border-[#1D3557] bg-white shadow-xl"
                    >
                      <div className="border-b border-zinc-200 bg-white px-4 py-2 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-[#1D3557]">
                          Fasa {idx + 1}: {meta.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActive(screenId);
                            setViewMode("device");
                          }}
                          className="text-[9px] font-black text-[#EF233C] underline cursor-pointer"
                        >
                          Fokus
                        </button>
                      </div>
                      <div className="h-[580px] overflow-y-auto">
                        {renderActiveScreen(screenId)}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: ALL-SCREENS MATRIX */}
        {viewMode === "matrix" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SCREENS.map((screen) => (
              <div
                key={screen.id}
                className="overflow-hidden rounded-[32px] border-[6px] border-[#1D3557] bg-white shadow-lg flex flex-col"
              >
                <div className="border-b border-zinc-200 bg-white p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#EF233C] block">
                      {screen.badge}
                    </span>
                    <h3 className="text-xs font-black text-[#1D3557]">{screen.label}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setActive(screen.id);
                      setViewMode("device");
                    }}
                    className="rounded-lg bg-[#1D3557] text-white px-2 py-1 text-[8px] font-black uppercase cursor-pointer"
                  >
                    Buka
                  </button>
                </div>
                <div className="h-[460px] overflow-y-auto">
                  {renderActiveScreen(screen.id)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

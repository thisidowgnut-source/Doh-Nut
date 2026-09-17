"use client";

import { motion } from "framer-motion";
import { useShop } from "@/store/use-shop";
import { cn } from "@/lib/utils";

type ClayIconName = "shop" | "saved" | "cart" | "orders";

function ClayIcon({ name }: { name: ClayIconName }) {
  return (
    <span className={cn("clay-nav-icon", `clay-nav-icon-${name}`)} aria-hidden="true">
      <span className="clay-nav-icon-shape" />
      <span className="clay-nav-icon-detail" />
    </span>
  );
}

export function BottomNav() {
  const view = useShop((s) => s.view);
  const setView = useShop((s) => s.setView);
  const cartOpen = useShop((s) => s.cartOpen);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const cart = useShop((s) => s.cart);
  const favorites = useShop((s) => s.favorites);

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);
  const favCount = favorites.length;

  interface NavItem {
    key: "shop" | "favorites" | "cart" | "orders";
    label: string;
    icon: ClayIconName;
    badge?: number;
    action?: () => void;
  }

  const items: NavItem[] = [
    {
      key: "shop",
      label: "Shop",
      icon: "shop",
      action: () => {
        setCartOpen(false);
        setView("shop");
      },
    },
    {
      key: "favorites",
      label: "Saved",
      icon: "saved",
      badge: favCount > 0 ? favCount : undefined,
      action: () => {
        setCartOpen(false);
        setView("favorites");
      },
    },
    {
      key: "cart",
      label: "Cart",
      icon: "cart",
      badge: cartCount > 0 ? cartCount : undefined,
      action: () => setCartOpen(true),
    },
    {
      key: "orders",
      label: "Orders",
      icon: "orders",
      action: () => {
        setCartOpen(false);
        setView("orders");
      },
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[var(--color-dowgnut-blue-dark)]/20 bg-[var(--color-dowgnut-lime)]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_rgba(29,53,87,0.16),inset_0_2px_0_rgba(255,255,255,0.55)] backdrop-blur-xl"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 sm:max-w-lg md:max-w-xl">
        {items.map((item) => {
          // Robust active state resolution so navbar is always 100% consistent across all sub-views
          const isActive =
            item.key === "shop"
              ? (view === "shop" || view === "slider") && !cartOpen
              : item.key === "cart"
              ? cartOpen
              : item.key === "favorites"
              ? view === "favorites" && !cartOpen
              : item.key === "orders"
              ? (view === "orders" || view === "tracking") && !cartOpen
              : false;

          return (
            <motion.button
              key={item.key}
              onClick={item.action}
              whileTap={{ scale: 0.92, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 cursor-pointer transition-colors select-none rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-blue-dark)]",
                isActive
                  ? "text-white"
                  : "text-[var(--color-dowgnut-blue-dark)]/85 hover:text-[var(--color-dowgnut-blue-dark)]"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute top-0 h-1.5 w-10 rounded-full bg-[var(--color-dowgnut-blue-dark)] shadow-[0_2px_0_rgba(255,255,255,0.55)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-[15px] border-2 transition-all duration-150",
                  isActive
                    ? "border-[var(--color-dowgnut-blue-dark)] bg-[var(--color-dowgnut-pink)] shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-3px_0_rgba(139,18,31,0.25),0_3px_0_var(--color-dowgnut-blue-dark),0_6px_10px_rgba(29,53,87,0.2)]"
                    : "border-[var(--color-dowgnut-blue-dark)]/20 bg-[var(--color-dowgnut-cream)]/75 shadow-[inset_0_2px_0_rgba(255,255,255,0.7),0_2px_0_rgba(29,53,87,0.12)]"
                )}
              >
                <ClayIcon name={item.icon} />

                {/* Live Badge Pop Animation */}
                {item.badge && item.badge > 0 ? (
                  <motion.span
                    key={item.badge}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 14 }}
                    className="absolute -right-2.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-[var(--color-dowgnut-cream)]"
                  >
                    {item.badge}
                  </motion.span>
                ) : null}
              </div>

              <span
                className={cn(
                  "text-[11px] leading-tight tracking-tight transition-colors duration-150",
                  isActive ? "font-black text-[var(--color-dowgnut-blue)]" : "font-bold text-[var(--color-dowgnut-blue-dark)]/85"
                )}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

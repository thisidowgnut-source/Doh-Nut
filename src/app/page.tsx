"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useShop } from "@/store/use-shop";
import { useToast } from "@/hooks/use-toast";
import { SplashScreen } from "@/components/dohnut/splash-screen";
import { DohnutHeader } from "@/components/dohnut/dohnut-header";
import { BottomNav } from "@/components/dohnut/bottom-nav";
import { SwipeView } from "@/components/dohnut/swipe-view";
import { DonutSlider } from "@/components/dohnut/donut-slider";
import { FavoritesView } from "@/components/dohnut/favorites-view";
import { CheckoutView } from "@/components/dohnut/checkout-view";
import { OrdersView } from "@/components/dohnut/orders-view";
import { OrderTrackingView } from "@/components/dohnut/order-tracking-view";
import { AdminDashboard } from "@/components/dohnut/admin-dashboard";
import { DetailModal } from "@/components/dohnut/detail-modal";
import { CartDrawer } from "@/components/dohnut/cart-drawer";
import { AIConcierge } from "@/components/dohnut/ai-concierge";
import { AIDesigner } from "@/components/dohnut/ai-designer";
import { ShopHome } from "@/components/dohnut/shop-home";
import { ErrorBoundary } from "@/components/dohnut/error-boundary";
import { apiFetch } from "@/lib/api";
import { classifyPaymentState } from "@/lib/payment-state";
import type { Order } from "@/lib/types";

// Sheet-stack motion language (matches the 2nd→3rd detail sheet exactly):
// The base shop view is ALWAYS mounted underneath. Every other view is a
// SHEET that slides UP from the bottom OVER the current screen (300ms) and
// slides back DOWN (250ms) when dismissed — identical in BOTH navigation
// directions, exactly like a bottom-sheet stack.
const viewVariants: Variants = {
  initial: { opacity: 0.6, y: "100%" },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0.6,
    y: "100%",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

// NOTE: AdminDashboard (recharts) + OrderTrackingView (socket.io-client) were
// trialled as next/dynamic code-splits but that deadlocks with
// AnimatePresence mode="wait" (lazy subtree suspends mid-enter → the view
// never commits and the app blanks). Keep static imports; split the heavy
// DEPS inside those components instead if bundle size ever matters.

export default function Home() {
  const view = useShop((s) => s.view);
  const init = useShop((s) => s.init);
  const startTracking = useShop((s) => s.startTracking);
  const setView = useShop((s) => s.setView);
  const { toast } = useToast();
  const paymentReturnHandled = useRef(false);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
  const attachScrollContainer = useCallback((node: HTMLDivElement | null) => {
    setScrollContainer(node);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  // A redirect is not proof of payment. Reload the session-owned order and
  // wait briefly for a signed webhook before announcing success.
  useEffect(() => {
    if (paymentReturnHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("payment_return") ?? params.get("paid");
    if (!orderId) return;
    paymentReturnHandled.current = true;

    let cancelled = false;
    const verifyReturn = async () => {
      try {
        let order: Order | null = null;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          order = await apiFetch<Order>(`/api/orders/${encodeURIComponent(orderId)}`);
          if (classifyPaymentState({ status: order.status, paidAt: order.paidAt }) !== "pending") {
            break;
          }
          await new Promise((resolve) => window.setTimeout(resolve, 1000));
        }
        if (cancelled || !order) return;

        const paymentState = classifyPaymentState({
          status: order.status,
          paidAt: order.paidAt,
        });
        if (order.status === "payment_review") {
          setView("orders");
          toast({
            title: "Payment received — order review needed",
            description: "Your payment is recorded. Our team needs to review item availability before fulfilment.",
          });
        } else if (paymentState === "paid") {
          startTracking(order.id, order.customerName);
          toast({
            title: "Payment received 🍩",
            description: "DOH BOLEH! Your order is confirmed — the fryer is warming up.",
          });
        } else if (paymentState === "failed") {
          setView("checkout");
          toast({
            title: "Payment not completed",
            description: "Your cart is still here. Review it and try payment again.",
            variant: "destructive",
          });
        } else {
          setView("orders");
          toast({
            title: "Payment confirmation pending",
            description: "We have not received confirmation yet. Your order will update automatically.",
          });
        }
      } catch {
        if (cancelled) return;
        setView("orders");
        toast({
          title: "Could not verify payment",
          description: "No success has been recorded. Open Orders to check again.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };
    void verifyReturn();
    return () => {
      cancelled = true;
      paymentReturnHandled.current = false;
    };
  }, [setView, startTracking, toast]);

  // Direction note: shop↔slider previously used a zoom crossfade in a
  // separate presence tree — unified into one keyed child for reliability
  // (see comment in main). Views all slide for a consistent rhythm.

  return (
    <>
      <SplashScreen />
      <DohnutHeader scrollContainer={scrollContainer} />
      <ErrorBoundary>
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* ── SHEET STACK ───────────────────────────────────────────────
            The base shop (1st) view is ALWAYS mounted underneath. Every
            other view is a SHEET that slides up over the current screen
            (exactly like the 2nd→3rd detail sheet), in both directions.
            AnimatePresence popLayout keeps outgoing sheets mounted during
            their exit slide-down; they unmount after completion. ───────── */}
          <div
            ref={attachScrollContainer}
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            {/* 1st — base shop, always mounted, never unmounts */}
            <div
              className={`min-h-full pb-[calc(4rem+env(safe-area-inset-bottom,0px))] flex flex-col ${view !== "shop" ? "pointer-events-none" : ""}`}
            >
              <ShopHome />
            </div>
          </div>
          {/* Sheets layer — slides over the base */}
          <div className="absolute inset-0 z-30">
            <AnimatePresence initial={false} mode="popLayout">
              {view !== "shop" && (
                <motion.div
                  key={view}
                  variants={viewVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] bg-[var(--background)] overflow-y-auto overscroll-contain flex flex-col"
                >
                  {view === "slider" && <DonutSlider />}
                  {view === "swipe" && <SwipeView />}
                  {view === "favorites" && <FavoritesView />}
                  {view === "checkout" && <CheckoutView />}
                  {view === "orders" && <OrdersView />}
                  {view === "tracking" && <OrderTrackingView />}
                  {view === "admin" && <AdminDashboard />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </ErrorBoundary>

      {/* Bottom nav on ALL views — no desktop dead-end */}
      <BottomNav />

      <DetailModal />
      <CartDrawer />
      {/* AI Concierge FAB (all views) + AI Designer FAB (added this session) */}
      <AIConcierge />
      <AIDesigner />
    </>
  );
}

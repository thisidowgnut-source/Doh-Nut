"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Screen =
  | "home"
  | "slider"
  | "detail"
  | "shop"
  | "cart"
  | "checkout"
  | "orders";

const screens: { id: Screen; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "slider", label: "Ring slider" },
  { id: "detail", label: "Detail popup" },
  { id: "shop", label: "Shop grid" },
  { id: "cart", label: "Cart drawer" },
  { id: "checkout", label: "Checkout" },
  { id: "orders", label: "Orders" },
];

const placeholderDonuts = [
  { name: "Classic Glazed", tone: "bg-zinc-300" },
  { name: "Vanilla Bean", tone: "bg-zinc-400" },
  { name: "Matcha White Choco", tone: "bg-zinc-300" },
];

function Block({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border-2 border-zinc-300 bg-zinc-100", className)}>
      {children}
    </div>
  );
}

function DonutPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex aspect-square items-center justify-center rounded-full border-[18px] border-zinc-400 bg-zinc-200 text-center text-xs font-bold text-zinc-600", className)}>
      <span>{label}</span>
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  return (
    <div className="grid grid-cols-4 gap-1 border-t-2 border-zinc-300 bg-white p-2 text-center text-[10px] font-bold text-zinc-500">
      {["Shop", "Saved", "Cart", "Orders"].map((item) => (
        <div key={item} className={cn("rounded-lg p-2", active === item && "bg-zinc-800 text-white")}>
          <div className="mx-auto mb-1 size-5 rounded border border-current" />
          {item}
        </div>
      ))}
    </div>
  );
}

function HomeScreen({ onOpen }: { onOpen: (screen: Screen) => void }) {
  return (
    <div className="flex min-h-[620px] flex-col bg-zinc-50">
      <header className="p-5 text-center">
        <Block className="mx-auto h-7 w-32 rounded-full bg-zinc-300" />
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-zinc-500">What&apos;s your flava?</p>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-5">
        {placeholderDonuts.map((donut, i) => (
          <button key={donut.name} type="button" onClick={() => onOpen(i === 1 ? "detail" : "slider")} className="relative -my-5 cursor-pointer">
            <DonutPlaceholder label={donut.name} className={cn("size-40 shadow-lg", donut.tone, i === 1 && "size-48")} />
          </button>
        ))}
        <div className="mt-5 flex gap-2"><span className="h-2 w-6 rounded-full bg-zinc-800" /><span className="size-2 rounded-full bg-zinc-300" /><span className="size-2 rounded-full bg-zinc-300" /></div>
      </main>
      <BottomNav active="Shop" />
    </div>
  );
}

function SliderScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex min-h-[620px] flex-col bg-zinc-50">
      <header className="flex items-center justify-between p-4"><span className="text-xl">←</span><span className="text-xs font-bold uppercase tracking-widest">Classic · 4/8</span><span>⋯</span></header>
      <main className="flex flex-1 flex-col justify-center gap-4 p-4">
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden">
          <DonutPlaceholder label="active donut" className="size-52 bg-zinc-300" />
          <div className="absolute inset-x-0 bottom-8 flex justify-between"><DonutPlaceholder label="" className="size-20 border-8 bg-zinc-200" /><DonutPlaceholder label="" className="size-20 border-8 bg-zinc-200" /></div>
        </div>
        <Block className="p-4 text-center">
          <div className="mx-auto h-5 w-44 rounded bg-zinc-300" />
          <div className="mx-auto mt-2 h-3 w-32 rounded bg-zinc-200" />
          <div className="mt-4 flex justify-center gap-3"><span className="rounded-full bg-zinc-800 px-8 py-3 text-xs font-bold text-white">Add to cart</span><span className="rounded-full border-2 border-zinc-400 px-3 py-2">− 1 +</span></div>
        </Block>
      </main>
      <BottomNav active="Shop" />
    </div>
  );
}

function DetailScreen() {
  return (
    <div className="flex min-h-[620px] flex-col bg-zinc-50">
      <header className="flex justify-between p-4"><span className="text-xs font-bold uppercase">Donut detail</span><span>×</span></header>
      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
        <Block className="flex items-center gap-4 p-4"><DonutPlaceholder label="donut" className="size-36 shrink-0 border-[14px]" /><div><div className="h-6 w-36 rounded bg-zinc-400" /><div className="mt-2 h-3 w-24 rounded bg-zinc-200" /><p className="mt-3 text-xs text-zinc-500">Name, rating, stock, description.</p></div></Block>
        <div className="grid grid-cols-3 gap-2"><Block className="h-16" /><Block className="h-16" /><Block className="h-16" /></div>
        <Block className="flex-1 p-4"><div className="h-4 w-28 rounded bg-zinc-300" /><div className="mt-3 h-20 rounded bg-zinc-200" /></Block>
      </main>
      <div className="grid grid-cols-2 gap-2 border-t-2 border-zinc-300 bg-white p-4"><button className="rounded-full border-2 border-zinc-400 py-3 text-xs font-bold">Add to cart</button><button className="rounded-full bg-zinc-800 py-3 text-xs font-bold text-white">Buy now</button></div>
    </div>
  );
}

function ShopScreen() {
  return <div className="min-h-[620px] bg-zinc-50 p-4"><header className="mb-4"><div className="h-8 w-28 rounded bg-zinc-400" /><div className="mt-3 h-10 rounded-full border-2 border-zinc-300 bg-white px-4 py-3 text-xs text-zinc-400">Search donuts...</div></header><div className="mb-4 flex gap-2 overflow-hidden">{["All", "Classic", "Sprinkled", "Stuffed"].map((x, i) => <span key={x} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold", i === 0 ? "bg-zinc-800 text-white" : "bg-zinc-200 text-zinc-600")}>{x}</span>)}</div><div className="grid grid-cols-2 gap-3">{Array.from({ length: 6 }, (_, i) => <Block key={i} className="p-2"><DonutPlaceholder label="" className="size-full border-[12px]" /><div className="mt-2 h-4 w-3/4 rounded bg-zinc-300" /><div className="mt-2 h-3 w-1/3 rounded bg-zinc-200" /></Block>)}</div></div>;
}

function CartScreen() {
  return <div className="flex min-h-[620px] flex-col bg-zinc-50"><header className="border-b-2 border-zinc-300 bg-white p-5"><div className="h-6 w-32 rounded bg-zinc-400" /><div className="mt-2 h-3 w-24 rounded bg-zinc-200" /></header><main className="flex-1 space-y-3 p-4">{["Classic Glazed", "Vanilla Bean"].map((x) => <Block key={x} className="flex items-center gap-3 p-3"><DonutPlaceholder label="" className="size-16 border-8" /><div className="flex-1"><div className="h-4 w-28 rounded bg-zinc-300" /><div className="mt-2 h-3 w-16 rounded bg-zinc-200" /></div><span className="rounded-full border px-2 py-1 text-xs">− 1 +</span></Block>)}</main><div className="border-t-2 border-zinc-300 bg-white p-4"><div className="flex justify-between text-sm font-bold"><span>Total</span><span>RM 8.40</span></div><button className="mt-3 w-full rounded-full bg-zinc-800 py-3 text-xs font-bold text-white">Checkout</button></div></div>;
}

function CheckoutScreen() {
  return <div className="min-h-[620px] bg-zinc-50 p-4"><header className="mb-5 flex justify-between"><span>←</span><span className="text-xs font-bold uppercase">Checkout</span><span>1/2</span></header><div className="space-y-3">{["Name", "Email", "Phone", "Address", "City / State / Postcode"].map((x) => <div key={x}><label className="mb-1 block text-[10px] font-bold uppercase text-zinc-500">{x}</label><div className="h-11 rounded-lg border-2 border-zinc-300 bg-white" /></div>)}</div><Block className="mt-5 p-3"><div className="flex justify-between text-xs"><span>Payment method</span><span>Touch &apos;n Go ›</span></div></Block><button className="mt-5 w-full rounded-full bg-zinc-800 py-3 text-xs font-bold text-white">Place order</button></div>;
}

function OrdersScreen() {
  return <div className="min-h-[620px] bg-zinc-50 p-4"><header className="mb-5"><div className="h-7 w-28 rounded bg-zinc-400" /><div className="mt-2 h-3 w-48 rounded bg-zinc-200" /></header><Block className="mb-4 p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold">Order #DN-1042</span><span className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] text-white">Baking</span></div><div className="my-5 h-2 rounded-full bg-zinc-300"><div className="h-2 w-2/3 rounded-full bg-zinc-700" /></div><div className="grid grid-cols-4 text-center text-[10px] text-zinc-500"><span>Paid</span><span>Preparing</span><span className="font-bold text-zinc-800">Baking</span><span>Delivered</span></div></Block><Block className="p-4"><div className="h-4 w-32 rounded bg-zinc-300" /><div className="mt-3 h-16 rounded bg-zinc-200" /></Block></div>;
}

export function WireframeBoard() {
  const [active, setActive] = useState<Screen>("home");
  const content = {
    home: <HomeScreen onOpen={setActive} />,
    slider: <SliderScreen onOpen={() => setActive("detail")} />,
    detail: <DetailScreen />,
    shop: <ShopScreen />,
    cart: <CartScreen />,
    checkout: <CheckoutScreen />,
    orders: <OrdersScreen />,
  }[active];

  return (
    <main className="min-h-screen bg-zinc-200 p-4 font-sans text-zinc-800 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">DOH-NUT UX / Wireframe</p><h1 className="mt-1 text-2xl font-black">Complete mobile-first flow</h1><p className="mt-1 text-sm text-zinc-500">Mid-fidelity preview — original clay UI remains unchanged.</p></div>
          <nav className="flex gap-1 overflow-x-auto rounded-xl bg-zinc-300 p-1">{screens.map((screen) => <button key={screen.id} type="button" onClick={() => setActive(screen.id)} className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold", active === screen.id ? "bg-white shadow-sm" : "text-zinc-500")}>{screen.label}</button>)}</nav>
        </header>
        <section className="grid gap-6 lg:grid-cols-[minmax(280px,390px)_1fr]">
          <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[32px] border-8 border-zinc-800 bg-white shadow-2xl">{content}</div>
          <aside className="rounded-2xl border-2 border-dashed border-zinc-400 bg-zinc-100 p-5"><h2 className="font-black">Screen notes</h2><div className="mt-4 space-y-3 text-sm text-zinc-600"><p><strong className="text-zinc-800">Primary goal:</strong> {screens.find((screen) => screen.id === active)?.label} flow.</p><p><strong className="text-zinc-800">Mobile rule:</strong> one primary action per viewport, fixed bottom navigation, safe-area spacing.</p><p><strong className="text-zinc-800">Interaction:</strong> tap areas, swipe affordances, loading and empty states are reserved in the layout.</p><p><strong className="text-zinc-800">Next design pass:</strong> replace blocks with approved clay surfaces only after this structure is accepted.</p></div></aside>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Loader2, ShoppingBag, Truck, Check, ShieldCheck, Zap } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useGamification } from "@/store/use-gamification";
import { celebrateOrderComplete } from "@/lib/celebrations";
import { playOrderComplete } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { computePricing } from "@/lib/pricing";
import { getSessionId } from "@/lib/api";
import { isAllowedBillplzPaymentUrl } from "@/lib/billplz-redirect";

type PaymentMethod = "tng" | "duitnow" | "card";
type CheckoutField =
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "address"
  | "city"
  | "state"
  | "zip"
  | "notes";

type CheckoutForm = Record<CheckoutField, string>;

const VALIDATION_FIELDS: Exclude<CheckoutField, "notes">[] = [
  "customerName",
  "customerEmail",
  "customerPhone",
  "address",
  "city",
  "state",
  "zip",
];

const PRESET_ADDRESSES = [
  { label: "KLCC, Kuala Lumpur", city: "Kuala Lumpur", state: "WP Kuala Lumpur", zip: "50450", address: "Suria KLCC, Jalan Ampang" },
  { label: "Petaling Jaya, Selangor", city: "Petaling Jaya", state: "Selangor", zip: "47301", address: "Jalan SS 21/37, Damansara Utama" },
  { label: "Shah Alam, Selangor", city: "Shah Alam", state: "Selangor", zip: "40000", address: "Seksyen 7, Persiaran Masjid" },
  { label: "Bangsar, Kuala Lumpur", city: "Kuala Lumpur", state: "WP Kuala Lumpur", zip: "59100", address: "Jalan Telawi, Bangsar" },
];

const PAYMENTS: {
  id: PaymentMethod;
  name: string;
  desc: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
}[] = [
  {
    id: "tng",
    name: "Touch 'n Go",
    desc: "Pay with TNG eWallet",
    badge: "TNG",
    badgeBg: "bg-[#005EB8]",
    badgeColor: "text-white",
  },
  {
    id: "duitnow",
    name: "DuitNow QR / FPX",
    desc: "Instant online banking",
    badge: "DN",
    badgeBg: "bg-[var(--color-dowgnut-blue-dark)]",
    badgeColor: "text-white",
  },
  {
    id: "card",
    name: "Debit / Credit Card",
    desc: "Visa / Mastercard",
    badge: "💳",
    badgeBg: "bg-white",
    badgeColor: "text-[var(--color-dowgnut-blue-dark)]",
  },
];

export function CheckoutView() {
  const cart = useShop((s) => s.cart);
  const checkout = useShop((s) => s.checkout);
  const loadCart = useShop((s) => s.loadCart);
  const setView = useShop((s) => s.setView);
  const startTracking = useShop((s) => s.startTracking);
  const recordOrder = useGamification((s) => s.recordOrder);
  const profile = useShop((s) => s.profile);
  const { toast } = useToast();

  // Pre-fill from saved profile + default address (return customer)
  const defaultAddr = profile?.addresses.find((a) => a.isDefault) ?? profile?.addresses[0];

  const [form, setForm] = useState<CheckoutForm>({
    customerName: profile?.customerName ?? "",
    customerEmail: profile?.customerEmail ?? "",
    customerPhone: profile?.customerPhone ?? defaultAddr?.customerPhone ?? "",
    address: defaultAddr?.address ?? "",
    city: defaultAddr?.city ?? "",
    state: defaultAddr?.state ?? "",
    zip: defaultAddr?.zip ?? "",
    notes: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("tng");
  const [submitting, setSubmitting] = useState(false);
  const [failedPaymentOrderId, setFailedPaymentOrderId] = useState<string | null>(null);
  const [failedPaymentCustomerName, setFailedPaymentCustomerName] = useState("");
  const [failedPaymentMethod, setFailedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [failedPaymentDonutNames, setFailedPaymentDonutNames] = useState<string[]>([]);
  const [failedPaymentTypes, setFailedPaymentTypes] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const fieldRefs = useRef<Partial<Record<CheckoutField, HTMLElement | null>>>({});

  const subtotal = cart.reduce((sum, c) => sum + c.donut.price * c.quantity, 0);
  const { delivery, sst, total } = computePricing(subtotal);

  const setFieldRef = (field: CheckoutField) => (element: HTMLElement | null) => {
    fieldRefs.current[field] = element;
  };

  const set = (k: CheckoutField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFieldErrors((errors) => {
      if (!errors[k]) return errors;
      const next = { ...errors };
      delete next[k];
      return next;
    });
  };

  const applyPreset = (preset: typeof PRESET_ADDRESSES[0]) => {
    setForm((f) => ({
      ...f,
      address: preset.address,
      city: preset.city,
      state: preset.state,
      zip: preset.zip,
    }));
    toast({
      title: "Preset applied 📍",
      description: preset.label,
    });
  };

  const validate = (): Partial<Record<CheckoutField, string>> => {
    const errors: Partial<Record<CheckoutField, string>> = {};
    if (!form.customerName.trim()) errors.customerName = "Recipient name is required.";
    if (!form.customerEmail.trim()) {
      errors.customerEmail = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail.trim())) {
      errors.customerEmail = "Enter a valid email address.";
    }
    if (!form.customerPhone.trim()) {
      errors.customerPhone = "Phone number is required.";
    } else if (!/^[0-9+\-\s]{10,15}$/.test(form.customerPhone.trim())) {
      errors.customerPhone = "Enter a valid phone number.";
    }
    if (!form.address.trim()) errors.address = "Street address is required.";
    if (!form.city.trim()) errors.city = "City is required.";
    if (!form.state.trim()) errors.state = "State is required.";
    if (!form.zip.trim()) {
      errors.zip = "Postcode is required.";
    } else if (!/^\d{5}$/.test(form.zip.trim())) {
      errors.zip = "Postcode must contain 5 digits.";
    }
    return errors;
  };

  const clearFailedPayment = () => {
    setFailedPaymentOrderId(null);
    setFailedPaymentCustomerName("");
    setFailedPaymentMethod(null);
    setFailedPaymentDonutNames([]);
    setFailedPaymentTypes([]);
  };

  const rememberFailedPayment = (
    orderId: string,
    customerName: string,
    paymentMethod: PaymentMethod,
    donutNames: string[],
    types: string[],
  ) => {
    setFailedPaymentOrderId(orderId);
    setFailedPaymentCustomerName(customerName);
    setFailedPaymentMethod(paymentMethod);
    setFailedPaymentDonutNames(donutNames);
    setFailedPaymentTypes(types);
  };

  const startPayment = async (
    orderId: string,
    customerName: string,
    paymentMethod: PaymentMethod,
    donutNames: string[],
    types: string[],
  ) => {
    let billRes: Response;
    try {
      billRes = await fetch("/api/payment/billplz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": getSessionId(),
        },
        body: JSON.stringify({ orderId }),
      });
    } catch (error) {
      rememberFailedPayment(orderId, customerName, paymentMethod, donutNames, types);
      throw error instanceof Error ? error : new Error("Payment request failed");
    }
    const billData = (await billRes.json().catch(() => ({}))) as {
      paymentUrl?: string;
      mode?: string;
      error?: string;
    };

    if (billRes.ok && billData.paymentUrl) {
      if (!isAllowedBillplzPaymentUrl(billData.paymentUrl)) {
        rememberFailedPayment(orderId, customerName, paymentMethod, donutNames, types);
        toast({
          title: "Payment redirect blocked",
          description:
            "The gateway returned an invalid destination. No payment was completed.",
          variant: "destructive",
        });
        return;
      }
      clearFailedPayment();
      toast({
        title: "Redirecting to payment…",
        description: `${PAYMENTS.find((p) => p.id === paymentMethod)?.name} secured by Billplz.`,
      });
      celebrateOrderComplete();
      playOrderComplete();
      recordOrder(donutNames, types);
      startTracking(orderId, customerName);
      window.location.assign(billData.paymentUrl);
      return;
    }

    if (billRes.ok && billData.mode === "dev") {
      await loadCart();
      clearFailedPayment();
      toast({
        title: "Payment successful! 🍩",
        description: `Order confirmed via ${PAYMENTS.find((p) => p.id === paymentMethod)?.name}.`,
      });
      celebrateOrderComplete();
      playOrderComplete();
      recordOrder(donutNames, types);
      startTracking(orderId, customerName);
      return;
    }

    if (billRes.status === 409) {
      clearFailedPayment();
      toast({
        title: "Order already paid 🍩",
        description: "DOH BOLEH! Taking you straight to your order.",
      });
      startTracking(orderId, customerName);
      return;
    }

    rememberFailedPayment(orderId, customerName, paymentMethod, donutNames, types);
    toast({
      title: "Payment could not be started",
      description:
        billData.error ??
        "The payment gateway hiccuped. Your order is saved — please try again in a moment.",
      variant: "destructive",
    });
  };

  const onRetryPayment = async () => {
    if (!failedPaymentOrderId || !failedPaymentCustomerName || !failedPaymentMethod) return;
    setSubmitting(true);
    try {
      await startPayment(
        failedPaymentOrderId,
        failedPaymentCustomerName,
        failedPaymentMethod,
        failedPaymentDonutNames,
        failedPaymentTypes,
      );
    } catch (err: any) {
      toast({
        title: "Couldn't retry payment",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onPlace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    const firstInvalid = VALIDATION_FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      toast({
        title: "Missing required fields",
        description: "Please review the highlighted fields before paying.",
        variant: "destructive",
      });
      return;
    }
    clearFailedPayment();
    setSubmitting(true);
    try {
      const order = await checkout({
        ...form,
        paymentMethod: payment,
      });
      await startPayment(
        order.id,
        form.customerName,
        payment,
        order.items.map((i: any) => i.name),
        cart.map((c) => c.donut.type),
      );
    } catch (err: any) {
      toast({
        title: "Couldn't place order",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  if (cart.length === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-[var(--color-dowgnut-blue-dark)]/15 bg-[var(--color-dowgnut-cream)] p-10 text-center">
          <ShoppingBag className="size-10 text-[var(--color-dowgnut-pink)]" />
          <h2 className="graffiti-text text-2xl text-[var(--color-dowgnut-blue-dark)]">
            Your cart is empty
          </h2>
          <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/70">
            Add some donuts before checking out!
          </p>
          <Button
            onClick={() => setView("shop")}
            className="rounded-full bg-[var(--color-dowgnut-pink)] px-6 text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
          >
            Go shopping
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("shop")}
            aria-label="Back to shop"
            className="inline-flex size-11 items-center justify-center rounded-full bg-white text-[var(--color-dowgnut-blue)] shadow-xs hover:bg-[var(--color-dowgnut-blue)] hover:text-white transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-dowgnut-pink-dark)]">
              Step 2 of 2
            </p>
            <h1 className="graffiti-text text-2xl text-[var(--color-dowgnut-blue-dark)] sm:text-3xl">
              Checkout & Delivery
            </h1>
          </div>
        </div>
      </header>

      <form onSubmit={onPlace} noValidate>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: delivery + payment */}
        <div className="flex flex-col gap-6">
          {/* Quick-Fill Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-dowgnut-blue-dark)]/70 shrink-0">
              <Zap className="size-3.5 text-amber-500 fill-amber-400" /> Quick Fill:
            </span>
            {PRESET_ADDRESSES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[var(--color-dowgnut-blue-dark)] shadow-2xs border border-[rgba(239,159,189,0.3)] hover:bg-white active:scale-95 transition-transform"
              >
                📍 {preset.label.split(",")[0]}
              </button>
            ))}
          </div>

          {/* Delivery details */}
          <Card className="gap-4 rounded-3xl border border-[rgba(239,159,189,0.3)] bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-xs">
            <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
              Delivery Address
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">Recipient Name *</Label>
                <Input id="name" ref={setFieldRef("customerName")} required autoComplete="name" value={form.customerName} onChange={set("customerName")} placeholder="Megat Danial" aria-invalid={fieldErrors.customerName ? true : undefined} aria-describedby={fieldErrors.customerName ? "customerName-error" : undefined} className="h-11 bg-white rounded-xl" />
                {fieldErrors.customerName && <p id="customerName-error" className="text-xs font-semibold text-[var(--color-dowgnut-pink-dark)]">{fieldErrors.customerName}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">Email Address *</Label>
                <Input id="email" ref={setFieldRef("customerEmail")} required type="email" autoComplete="email" spellCheck={false} value={form.customerEmail} onChange={set("customerEmail")} placeholder="megat@dohnut.com" aria-invalid={fieldErrors.customerEmail ? true : undefined} aria-describedby={fieldErrors.customerEmail ? "customerEmail-error" : undefined} className="h-11 bg-white rounded-xl" />
                {fieldErrors.customerEmail && <p id="customerEmail-error" className="text-xs font-semibold text-[var(--color-dowgnut-pink-dark)]">{fieldErrors.customerEmail}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">Phone Number *</Label>
                <Input id="phone" ref={setFieldRef("customerPhone")} required type="tel" inputMode="tel" pattern="[0-9+\-\s]{10,15}" autoComplete="tel" value={form.customerPhone} onChange={set("customerPhone")} placeholder="012-345 6789" aria-invalid={fieldErrors.customerPhone ? true : undefined} aria-describedby={fieldErrors.customerPhone ? "customerPhone-error" : undefined} className="h-11 bg-white rounded-xl" />
                {fieldErrors.customerPhone && <p id="customerPhone-error" className="text-xs font-semibold text-[var(--color-dowgnut-pink-dark)]">{fieldErrors.customerPhone}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zip" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">Postcode * (5 digits)</Label>
                <Input id="zip" ref={setFieldRef("zip")} required inputMode="numeric" pattern="\d{5}" autoComplete="postal-code" value={form.zip} onChange={set("zip")} placeholder="50450" maxLength={5} aria-invalid={fieldErrors.zip ? true : undefined} aria-describedby={fieldErrors.zip ? "zip-error" : undefined} className="h-11 bg-white rounded-xl" />
                {fieldErrors.zip && <p id="zip-error" className="text-xs font-semibold text-[var(--color-dowgnut-pink-dark)]">{fieldErrors.zip}</p>}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">Street Address *</Label>
                <Input id="address" ref={setFieldRef("address")} required autoComplete="street-address" value={form.address} onChange={set("address")} placeholder="Unit / Street / Building" aria-invalid={fieldErrors.address ? true : undefined} aria-describedby={fieldErrors.address ? "address-error" : undefined} className="h-11 bg-white rounded-xl" />
                {fieldErrors.address && <p id="address-error" className="text-xs font-semibold text-[var(--color-dowgnut-pink-dark)]">{fieldErrors.address}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">City *</Label>
                <Input id="city" ref={setFieldRef("city")} required autoComplete="address-level2" value={form.city} onChange={set("city")} placeholder="Kuala Lumpur" aria-invalid={fieldErrors.city ? true : undefined} aria-describedby={fieldErrors.city ? "city-error" : undefined} className="h-11 bg-white rounded-xl" />
                {fieldErrors.city && <p id="city-error" className="text-xs font-semibold text-[var(--color-dowgnut-pink-dark)]">{fieldErrors.city}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">State *</Label>
                <Select value={form.state} onValueChange={(v) => { setForm((f) => ({ ...f, state: v })); setFieldErrors((errors) => ({ ...errors, state: undefined })); }}>
                  <SelectTrigger id="state" ref={setFieldRef("state")} aria-required="true" aria-invalid={fieldErrors.state ? true : undefined} aria-describedby={fieldErrors.state ? "state-error" : undefined} className="h-11 rounded-xl border-[var(--color-dowgnut-blue-dark)]/15 bg-white text-sm font-semibold">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Selangor", "WP Kuala Lumpur", "WP Putrajaya", "Pulau Pinang", "Johor", "Perak", "Sabah", "Sarawak", "Negeri Sembilan", "Kedah", "Kelantan", "Terengganu", "Pahang", "Melaka", "Perlis"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.state && <p id="state-error" className="text-xs font-semibold text-[var(--color-dowgnut-pink-dark)]">{fieldErrors.state}</p>}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="notes" className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">Delivery Notes (optional)</Label>
                <Textarea id="notes" value={form.notes} onChange={set("notes")} placeholder="Leave at guardhouse, ring bell, etc." className="min-h-16 bg-white rounded-xl resize-none" />
              </div>
            </div>
          </Card>

          {/* Payment method — Malaysia gateways */}
          <Card className="gap-4 rounded-3xl border border-[rgba(239,159,189,0.3)] bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[var(--color-dowgnut-blue)]" />
              <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
                Select Payment Method
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PAYMENTS.map((p) => {
                const selected = payment === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPayment(p.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-3.5 text-left transition-all",
                      selected
                        ? "border-[var(--color-dowgnut-pink)] bg-white shadow-md scale-[1.02]"
                        : "border-[var(--color-dowgnut-blue-dark)]/10 bg-white/60 hover:border-[var(--color-dowgnut-blue-dark)]/30"
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-white shadow-2xs">
                        <Check className="size-3" />
                      </span>
                    )}
                    <span className={cn("inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-black shadow-2xs", p.badgeBg, p.badgeColor)}>
                      {p.badge}
                    </span>
                    <div>
                      <p className="text-sm font-black text-[var(--color-dowgnut-blue-dark)]">{p.name}</p>
                      <p className="text-[11px] text-[var(--color-dowgnut-blue-dark)]/60">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-medium text-[var(--color-dowgnut-blue-dark)]/60">
              🔒 100% Encrypted & Verified via Bank Negara Malaysia FPX / TNG eWallet.
            </p>
          </Card>
        </div>

        {/* Right: order summary */}
        <Card className="h-fit gap-3 rounded-3xl border border-[rgba(239,159,189,0.3)] bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-md">
          <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
            Order Summary
          </h2>
          <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-[var(--color-dowgnut-cream)] p-2 border border-white/60">
                <Image src={item.donut.imgUrl} alt={item.donut.name} width={48} height={48} sizes="48px" className="size-12 object-contain select-none" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="line-clamp-1 text-xs font-black text-[var(--color-dowgnut-blue-dark)]">{item.donut.name}</span>
                  <span className="text-[11px] font-semibold text-[var(--color-dowgnut-blue-dark)]/60">{item.quantity} × RM {item.donut.price.toFixed(2)}</span>
                </div>
                <span className="text-xs font-black text-[var(--color-dowgnut-blue-dark)]">RM {(item.donut.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1.5 border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-3 text-xs font-bold text-[var(--color-dowgnut-blue-dark)]/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-black text-[var(--color-dowgnut-blue-dark)]">RM {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1"><Truck className="size-3.5 text-[var(--color-dowgnut-pink)]" /> Delivery</span>
              <span className="font-black text-[var(--color-dowgnut-pink-dark)]">{delivery === 0 ? "FREE" : `RM ${delivery.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>SST (6%)</span>
              <span className="font-black text-[var(--color-dowgnut-blue-dark)]">RM {sst.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-2 text-base font-black text-[var(--color-dowgnut-blue-dark)]">
              <span>Total Payable</span>
              <span className="text-lg text-[var(--color-dowgnut-pink-dark)]">RM {total.toFixed(2)}</span>
            </div>
          </div>

          {failedPaymentOrderId && (
            <div className="rounded-2xl border border-[var(--color-dowgnut-pink)]/30 bg-[var(--color-dowgnut-pink)]/5 p-3 text-center">
              <p className="text-xs font-bold text-[var(--color-dowgnut-blue-dark)]">
                Payment wasn&apos;t started. Your order is saved.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void onRetryPayment()}
                disabled={submitting}
                className="mt-2 h-9 rounded-full border-[var(--color-dowgnut-pink)] px-4 text-xs font-bold text-[var(--color-dowgnut-pink-dark)] hover:bg-[var(--color-dowgnut-pink)]/10"
              >
                Retry payment
              </Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="mt-3 h-12 w-full rounded-full bg-[var(--color-dowgnut-pink)] text-sm font-black text-white hover:bg-[var(--color-dowgnut-pink-dark)] shadow-md active:scale-95 transition-transform"
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" /> Processing Payment…</>
            ) : (
              <>Pay RM {total.toFixed(2)} with {PAYMENTS.find((p) => p.id === payment)?.name}</>
            )}
          </Button>
        </Card>
      </div>
      </form>
    </section>
  );
}

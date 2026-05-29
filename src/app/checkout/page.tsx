"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Trash2,
  Minus,
  Plus,
  MapPin,
  Package,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  Loader2,
  Tag,
  Globe,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getUser } from "../../lib/auth";
import { CHECKOUT_STORAGE_KEY } from "../context/Cartcontext";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
export type CartItem = {
  productId: string;
  name: string;
  image: string;
  vendor: string;
  price: number;
  quantity: number;
  weight?: number;
};

type ShippingRate = {
  id: string;
  carrier: "dhl";
  name: string;
  description: string;
  price: number;
  eta: string;
  dhlProductCode: string;
  unavailable?: boolean;
  isFallback?: boolean;
};

type AddressForm = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  landmark?: string;
};

type OrderStep = "cart" | "address" | "shipping" | "review" | "payment";

/* ─────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────── */
const DHL_RATE_SLOTS: Array<{
  id: string;
  dhlProductCode: string;
  name: string;
  domesticEta: string;
  internationalEta: string;
  domesticDescription: string;
  internationalDescription: string;
}> = [
  {
    id: "dhl_express",
    dhlProductCode: "P",
    name: "DHL Express",
    domesticEta: "Next business day",
    internationalEta: "2–4 business days",
    domesticDescription: "Fast domestic delivery across Nigeria",
    internationalDescription: "International door-to-door delivery",
  },
  {
    id: "dhl_economy",
    dhlProductCode: "N",
    name: "DHL Economy / Domestic",
    domesticEta: "1–3 business days",
    internationalEta: "5–8 business days",
    domesticDescription: "Reliable economy delivery within Nigeria",
    internationalDescription: "Economy international shipping",
  },
  {
    id: "dhl_easy",
    dhlProductCode: "1",
    name: "DHL Express Easy",
    domesticEta: "Same / next day",
    internationalEta: "3–5 business days",
    domesticDescription: "Priority same-day or next-day within Nigeria",
    internationalDescription: "Easy international express",
  },
];

const STEPS: { key: OrderStep; label: string }[] = [
  { key: "cart", label: "Cart" },
  { key: "address", label: "Address" },
  { key: "shipping", label: "Shipping" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
];

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "France",
  "UAE",
];

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function buildLoadingRates(isDomestic: boolean): ShippingRate[] {
  return DHL_RATE_SLOTS.map((slot) => ({
    id: slot.id,
    carrier: "dhl" as const,
    name: slot.name,
    description: isDomestic
      ? slot.domesticDescription
      : slot.internationalDescription,
    price: 0,
    eta: "Fetching live rate…",
    dhlProductCode: slot.dhlProductCode,
    unavailable: false,
    isFallback: false,
  }));
}

async function fetchDHLRates(params: {
  originCountry: string;
  destinationCountry: string;
  totalWeightKg: number;
}) {
  console.log("📦 [FRONTEND] Requesting DHL rates:", params);

  const res = await fetch("/api/shipping/dhl/rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  console.log("🚚 [FRONTEND] DHL response:", data);

  if (!data.success) {
    console.error("❌ [FRONTEND] DHL rate fetch failed:", data.message);
    throw new Error(data.message || "Failed to fetch DHL rates");
  }

  return {
    rates: data.rates as Array<{
      productCode: string;
      productName: string;
      price: number;
      currency: string;
      deliveryTime: string | null;
      isFallback: boolean;
    }>,
    isFallback: data.isFallback as boolean,
  };
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function CheckoutPage() {
  const STEP_ORDER: OrderStep[] = [
    "cart",
    "address",
    "shipping",
    "review",
    "payment",
  ];

  const [step, setStep] = useState<OrderStep>("cart");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [rates, setRates] = useState<ShippingRate[]>(buildLoadingRates(true));
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [dhlLoading, setDhlLoading] = useState(false);
  const [dhlError, setDhlError] = useState<string | null>(null);
  const [isFallbackRates, setIsFallbackRates] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [address, setAddress] = useState<AddressForm>({
    fullName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    state: "",
    city: "",
    address: "",
    postalCode: "",
    landmark: "",
  });

  /* ── Load cart from localStorage ── */
  useEffect(() => {
    const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setCart(
        parsed.map((item: any) => ({
          productId:
            item.productId?.$oid ??
            item.productId ??
            String(item.id ?? Math.random()),
          name: item.name,
          image: item.image,
          vendor: item.vendor ?? "Marketplace Vendor",
          price: item.price,
          quantity: item.quantity ?? item.qty ?? 1,
          weight: item.weight ?? 0.5,
        })),
      );
    } catch {
      setCart([]);
    }
  }, []);

  /* ── Fetch DHL rates when entering the shipping step ── */
  useEffect(() => {
    if (step !== "shipping") return;
    if (!address.country) return;

    const isDomestic = address.country === "Nigeria";
    const totalWeight = cart.reduce(
      (acc, i) => acc + (i.weight ?? 0.5) * i.quantity,
      0,
    );

    setDhlLoading(true);
    setDhlError(null);
    setIsFallbackRates(false);
    setSelectedRateId("");
    setRates(buildLoadingRates(isDomestic));

    fetchDHLRates({
      originCountry: "NG",
      destinationCountry: address.country,
      totalWeightKg: totalWeight,
    })
      .then(({ rates: dhlRates, isFallback }) => {
        setIsFallbackRates(isFallback);

        const updated: ShippingRate[] = DHL_RATE_SLOTS.map((slot) => {
          const match = dhlRates.find(
            (d) => d.productCode === slot.dhlProductCode,
          );

          if (!match) {
            return {
              id: slot.id,
              carrier: "dhl" as const,
              name: slot.name,
              description: isDomestic
                ? slot.domesticDescription
                : slot.internationalDescription,
              price: 0,
              eta: "Not available for this destination",
              dhlProductCode: slot.dhlProductCode,
              unavailable: true,
              isFallback: false,
            };
          }

          const eta = match.deliveryTime
            ? new Date(match.deliveryTime).toLocaleDateString("en-NG", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            : isDomestic
              ? slot.domesticEta
              : slot.internationalEta;

          return {
            id: slot.id,
            carrier: "dhl" as const,
            name: slot.name,
            description: isDomestic
              ? slot.domesticDescription
              : slot.internationalDescription,
            price: match.price,
            eta,
            dhlProductCode: slot.dhlProductCode,
            unavailable: false,
            isFallback: match.isFallback,
          };
        });

        setRates(updated);

        const available = updated.filter((r) => !r.unavailable && r.price > 0);
        if (available.length) {
          const cheapest = available.reduce((a, b) =>
            a.price < b.price ? a : b,
          );
          setSelectedRateId(cheapest.id);
        } else {
          setDhlError(
            "No shipping options available for this destination. Please contact support.",
          );
        }
      })
      .catch((err: Error) => {
        setDhlError(err.message);
        setRates(
          buildLoadingRates(isDomestic).map((r) => ({
            ...r,
            eta: "Rate unavailable",
            unavailable: true,
          })),
        );
      })
      .finally(() => setDhlLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, address.country]);

  /* ── Calculations ── */
  const subtotal = useMemo(
    () => cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [cart],
  );
  const selectedRate = rates.find((r) => r.id === selectedRateId);
  const shippingCost = selectedRate?.price ?? 0;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shippingCost - discount;

  /* ── Cart actions ── */
  const increase = (id: string) =>
    setCart((p) =>
      p.map((i) =>
        i.productId === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  const decrease = (id: string) =>
    setCart((p) =>
      p.map((i) =>
        i.productId === id
          ? { ...i, quantity: Math.max(1, i.quantity - 1) }
          : i,
      ),
    );
  const removeItem = (id: string) =>
    setCart((p) => p.filter((i) => i.productId !== id));

  function applyPromo() {
    if (promoCode.toUpperCase() === "AUTOBRIDGE10") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
    }
  }

  function addressValid() {
    return (
      address.fullName.trim() &&
      address.email.includes("@") &&
      address.phone.trim().length >= 8 &&
      address.city.trim() &&
      address.address.trim()
    );
  }

  function shippingValid() {
    if (!selectedRate) return false;
    if (selectedRate.unavailable || selectedRate.price === 0) return false;
    return true;
  }

  /* ─────────────────────────────────────────────
     PAYSTACK PAYMENT HANDLER
     No top-level import/require of Paystack — that causes
     "window is not defined" during Next.js SSR.
     Instead we inject the v2 CDN script lazily at click time,
     purely client-side, then call window.PaystackPop.
  ───────────────────────────────────────────── */
  async function handlePaystack() {
    const user = getUser();
    if (!user?.id) {
      alert("Please log in to complete your purchase.");
      return;
    }
    if (!selectedRate) {
      alert("Please select a delivery method.");
      return;
    }
    if (!process.env.NEXT_PUBLIC_PAYSTACK_KEY) {
      alert("Payment configuration error. Please contact support.");
      return;
    }

    setPaystackLoading(true);

    try {
      // Inject Paystack v2 script once, only in the browser
      await new Promise<void>((resolve, reject) => {
        if (document.getElementById("paystack-inline-script")) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.id = "paystack-inline-script";
        script.src = "https://js.paystack.co/v2/inline.js";
        script.onload = () => resolve();
        script.onerror = () =>
          reject(
            new Error(
              "Failed to load Paystack script. Check your internet connection.",
            ),
          );
        document.body.appendChild(script);
      });

      const PaystackPopConstructor = (window as any).PaystackPop;
      if (!PaystackPopConstructor) {
        throw new Error(
          "Paystack failed to initialise. Please refresh and try again.",
        );
      }

      const popup = new PaystackPopConstructor();

      popup.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: address.email,
        amount: total * 100, // kobo
        currency: "NGN",
        ref: `AB-${Date.now()}`,

        onSuccess: async (transaction: { reference: string }) => {
          try {
            const res = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                paystackRef: transaction.reference,
                cart: cart.map((i) => ({ ...i, weight: i.weight ?? 0.5 })),
                address,
                shipping: {
                  rateId: selectedRate.id,
                  carrier: selectedRate.carrier,
                  name: selectedRate.name,
                  price: selectedRate.price,
                  eta: selectedRate.eta,
                  dhlProductCode: selectedRate.dhlProductCode,
                },
                subtotal,
                shippingCost,
                discount,
                total,
                promoCode: promoApplied ? promoCode : "",
              }),
            });

            const data = await res.json();
            if (!data.success)
              throw new Error(data.message || "Order creation failed");

            localStorage.removeItem(CHECKOUT_STORAGE_KEY);
            window.location.href = `/order-confirmation/${data.data.orderId}`;
          } catch (err: any) {
            alert(`Order failed: ${err.message}`);
            setPaystackLoading(false);
          }
        },

        onCancel: () => {
          setPaystackLoading(false);
        },
      });
    } catch (err: any) {
      alert(`Payment initialisation failed: ${err.message}`);
      setPaystackLoading(false);
    }
  }

  /* ── Navigation ── */
  const stepIndex = STEP_ORDER.indexOf(step);
  const goNext = () =>
    setStep(STEP_ORDER[Math.min(stepIndex + 1, STEP_ORDER.length - 1)]);
  const goPrev = () => setStep(STEP_ORDER[Math.max(stepIndex - 1, 0)]);

  const isDomestic = address.country === "Nigeria";

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <>
      <Navbar />
      <div
        className="min-h-screen"
        style={{
          background: "var(--background)",
          color: "var(--text-primary)",
        }}
      >
        {/* ── Top bar ── */}
        <div
          className="border-b sticky top-0 z-30 backdrop-blur-md"
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* CONTINUE SHOPPING */}
            <Link
              href="/marketplace"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <ArrowLeft size={15} />
              Continue Shopping
            </Link>

            {/* STEPS */}
            <ol className="hidden md:flex items-center gap-1">
              {STEPS.map((s, i) => {
                const done = stepIndex > i;
                const active = stepIndex === i;

                return (
                  <li key={s.key} className="flex items-center gap-1">
                    <button
                      onClick={() => done && setStep(s.key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        active
                          ? "bg-orange-500 text-white"
                          : done
                            ? "opacity-70 hover:opacity-100 cursor-pointer"
                            : "opacity-30 cursor-not-allowed"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 size={12} className="text-orange-400" />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]"
                          style={{
                            borderColor: active
                              ? "var(--primary)"
                              : "var(--border)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {i + 1}
                        </span>
                      )}

                      {s.label}
                    </button>

                    {i < STEPS.length - 1 && (
                      <div
                        className="w-6 h-px"
                        style={{
                          background: done ? "var(--primary)" : "var(--border)",
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ol>

            {/* SECURE LABEL */}
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <ShieldCheck size={14} style={{ color: "var(--primary)" }} />
              Secured checkout
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="space-y-5">
              {/* ─── CART ─── */}
              {step === "cart" && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-primary-theme">
                    Your Cart
                    <span className="ml-3 text-sm font-normal text-muted-theme">
                      ({cart.length} {cart.length === 1 ? "item" : "items"})
                    </span>
                  </h2>

                  {cart.length === 0 ? (
                    <div className="bg-surface border border-border rounded-3xl p-16 text-center">
                      <Package
                        size={48}
                        className="mx-auto mb-4 text-muted-theme"
                      />

                      <p className="text-secondary-theme mb-6">
                        Your cart is empty
                      </p>

                      <Link
                        href="/marketplace"
                        className="bg-primary hover:opacity-90 px-8 py-3 rounded-xl font-medium transition-colors inline-block text-white"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="bg-card border border-border rounded-2xl p-4 flex gap-4 hover:border-primary/30 transition-all"
                        >
                          {/* IMAGE */}
                          <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-surface">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-theme mb-1 truncate">
                              {item.vendor}
                            </p>

                            <h3 className="font-semibold leading-tight truncate text-primary-theme">
                              {item.name}
                            </h3>

                            <p className="text-primary font-bold text-lg mt-1">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>

                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-theme">
                                ₦{item.price.toLocaleString()} each
                              </p>
                            )}

                            {/* ACTIONS */}
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
                                <button
                                  onClick={() => decrease(item.productId)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors"
                                >
                                  <Minus size={13} />
                                </button>

                                <span className="text-sm font-medium w-5 text-center text-primary-theme">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() => increase(item.productId)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.productId)}
                                className="ml-auto text-muted-theme hover:text-red-400 transition-colors p-1.5"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* PROMO CODE */}
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2 text-primary-theme">
                          <Tag size={14} className="text-primary" />
                          Promo Code
                        </p>

                        <div className="flex gap-2">
                          <input
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value);
                              setPromoError("");
                            }}
                            placeholder="Enter code"
                            disabled={promoApplied}
                            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary disabled:opacity-50 text-primary-theme"
                          />

                          <button
                            onClick={applyPromo}
                            disabled={promoApplied || !promoCode}
                            className="bg-primary/10 border border-primary-border text-primary px-4 py-2.5 rounded-xl text-sm hover:bg-primary/20 transition-colors disabled:opacity-40"
                          >
                            {promoApplied ? "Applied ✓" : "Apply"}
                          </button>
                        </div>

                        {promoError && (
                          <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle size={11} /> {promoError}
                          </p>
                        )}

                        {promoApplied && (
                          <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                            <CheckCircle2 size={11} /> 10% discount applied
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* ─── ADDRESS ─── */}
              {step === "address" && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary-theme">
                    <MapPin size={20} className="text-primary" />
                    Delivery Address
                  </h2>

                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    {/* NAME + EMAIL */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          Full Name *
                        </label>
                        <input
                          value={address.fullName}
                          onChange={(e) =>
                            setAddress({ ...address, fullName: e.target.value })
                          }
                          placeholder="John Doe"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary text-primary-theme"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={address.email}
                          onChange={(e) =>
                            setAddress({ ...address, email: e.target.value })
                          }
                          placeholder="john@example.com"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary text-primary-theme"
                        />
                      </div>
                    </div>

                    {/* PHONE + COUNTRY */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) =>
                            setAddress({ ...address, phone: e.target.value })
                          }
                          placeholder="+234 800 000 0000"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary text-primary-theme"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          Country *
                        </label>

                        <div className="relative">
                          <select
                            value={address.country}
                            onChange={(e) =>
                              setAddress({
                                ...address,
                                country: e.target.value,
                              })
                            }
                            className="w-full appearance-none bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary-theme"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-theme pointer-events-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* STATE + CITY */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          State / Province
                        </label>

                        {address.country === "Nigeria" ? (
                          <div className="relative">
                            <select
                              value={address.state}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  state: e.target.value,
                                })
                              }
                              className="w-full appearance-none bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary-theme"
                            >
                              <option value="">Select state</option>
                              {NIGERIAN_STATES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>

                            <ChevronDown
                              size={14}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-theme pointer-events-none"
                            />
                          </div>
                        ) : (
                          <input
                            value={address.state}
                            onChange={(e) =>
                              setAddress({ ...address, state: e.target.value })
                            }
                            placeholder="State / Province"
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary text-primary-theme"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          City *
                        </label>
                        <input
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                          placeholder="Lagos"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary text-primary-theme"
                        />
                      </div>
                    </div>

                    {/* ADDRESS */}
                    <div>
                      <label className="block text-xs text-muted-theme mb-1.5">
                        Street Address *
                      </label>
                      <textarea
                        rows={2}
                        value={address.address}
                        onChange={(e) =>
                          setAddress({ ...address, address: e.target.value })
                        }
                        placeholder="House number, street name, area"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary resize-none text-primary-theme"
                      />
                    </div>

                    {/* POSTAL + LANDMARK */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          Postal Code
                        </label>
                        <input
                          value={address.postalCode}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="100001"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary text-primary-theme"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-muted-theme mb-1.5">
                          Landmark (optional)
                        </label>
                        <input
                          value={address.landmark}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              landmark: e.target.value,
                            })
                          }
                          placeholder="Near Shoprite, Ikeja"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-theme focus:outline-none focus:border-primary text-primary-theme"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ─── SHIPPING ─── */}
              {step === "shipping" && (
                <section>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 text-primary-theme">
                    <Truck size={20} className="text-orange-400" /> Shipping
                    Method
                  </h2>

                  <p className="text-muted-theme text-sm mb-5">
                    Delivering to {address.city}
                    {address.state ? `, ${address.state}` : ""},{" "}
                    {address.country}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      {isDomestic ? "🇳🇬 Domestic" : "🌍 International"}
                    </span>
                  </p>

                  {/* LOADING STATE */}
                  {dhlLoading && (
                    <div className="flex items-center gap-2 text-xs text-yellow-500 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                      <Loader2 size={13} className="animate-spin" />
                      Fetching live DHL rates for{" "}
                      {isDomestic ? "Nigeria" : address.country}…
                    </div>
                  )}

                  {/* FALLBACK NOTICE */}
                  {!dhlLoading && isFallbackRates && (
                    <div className="flex items-start gap-2 text-xs text-blue-500 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                      <Info size={13} className="mt-0.5 shrink-0" />
                      <span>
                        Showing estimated rates — live DHL rates temporarily
                        unavailable. Final rate confirmed at dispatch.
                      </span>
                    </div>
                  )}

                  {/* ERROR */}
                  {!dhlLoading && dhlError && (
                    <div className="flex items-start gap-2 text-xs text-red-500 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />
                      <span>{dhlError}</span>
                    </div>
                  )}

                  {/* SHIPPING OPTIONS */}
                  <div className="space-y-3">
                    {rates.map((rate) => {
                      if (!dhlLoading && rate.unavailable) return null;

                      const selected = selectedRateId === rate.id;

                      return (
                        <label
                          key={rate.id}
                          className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all
          ${
            selected
              ? "border-orange-500/40 bg-orange-500/5"
              : "surface-primary hover:border-orange-500/20"
          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0">
                            <Globe size={16} className="text-yellow-500" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-primary-theme text-sm">
                                {rate.name}
                              </p>

                              <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full">
                                DHL
                              </span>

                              {rate.isFallback && (
                                <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full">
                                  Estimated
                                </span>
                              )}
                            </div>

                            <p className="text-muted-theme text-xs mt-0.5">
                              {rate.description}
                            </p>

                            <p className="text-muted-theme text-xs flex items-center gap-1 mt-1">
                              <Clock size={10} />
                              {dhlLoading ? "Calculating…" : rate.eta}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            {dhlLoading ? (
                              <Loader2
                                size={14}
                                className="animate-spin text-muted-theme"
                              />
                            ) : (
                              <p className="font-bold text-orange-500">
                                ₦{rate.price.toLocaleString()}
                              </p>
                            )}
                          </div>

                          <input
                            type="radio"
                            name="shipping"
                            checked={selected}
                            onChange={() => setSelectedRateId(rate.id)}
                            className="accent-orange-500 shrink-0"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {/* INFO BOX */}
                  <div className="mt-4 flex items-start gap-3 surface-secondary border rounded-2xl p-4 text-xs text-muted-theme">
                    <Globe
                      size={14}
                      className="text-blue-500 mt-0.5 shrink-0"
                    />
                    <span>
                      {isDomestic
                        ? "All Nigerian deliveries are handled by DHL Express with door-to-door tracking."
                        : "International shipments include real-time tracking. A tracking number will be emailed after dispatch."}
                    </span>
                  </div>
                </section>
              )}

              {/* ─── REVIEW ─── */}
              {step === "review" && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary-theme">
                    <Package size={20} className="text-orange-400" /> Review
                    Your Order
                  </h2>

                  <div className="space-y-4">
                    {/* ITEMS */}
                    <div className="surface-primary border rounded-2xl p-5">
                      <p className="text-xs text-muted-theme uppercase tracking-widest mb-3">
                        Items
                      </p>

                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 py-2 border-b border border-border last:border-0"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-primary-theme truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-theme">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-orange-400">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* DELIVERY */}
                    <div className="surface-primary border rounded-2xl p-5">
                      <p className="text-xs text-muted-theme uppercase tracking-widest mb-3">
                        Delivery
                      </p>

                      <p className="text-sm font-medium text-primary-theme">
                        {address.fullName}
                      </p>

                      <p className="text-sm text-muted-theme mt-1">
                        {address.address}
                      </p>

                      <p className="text-sm text-muted-theme">
                        {address.city}
                        {address.state ? `, ${address.state}` : ""},{" "}
                        {address.country}
                      </p>

                      <p className="text-sm text-muted-theme">
                        {address.phone}
                      </p>
                    </div>

                    {/* SHIPPING */}
                    <div className="surface-primary border rounded-2xl p-5">
                      <p className="text-xs text-muted-theme uppercase tracking-widest mb-3">
                        Shipping
                      </p>

                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-yellow-500" />

                        <p className="text-sm text-primary-theme">
                          {selectedRate?.name}
                        </p>

                        {selectedRate?.isFallback && (
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full">
                            Estimated
                          </span>
                        )}

                        <p className="ml-auto text-sm font-semibold text-orange-500">
                          ₦{shippingCost.toLocaleString()}
                        </p>
                      </div>

                      {selectedRate && (
                        <p className="text-xs text-muted-theme mt-1 flex items-center gap-1">
                          <Clock size={10} /> {selectedRate.eta}
                        </p>
                      )}
                    </div>

                    {/* SUMMARY */}
                    <div className="surface-primary border rounded-2xl p-5 space-y-2.5 text-sm">
                      <div className="flex justify-between text-muted-theme">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-muted-theme">
                        <span>Shipping</span>
                        <span>₦{shippingCost.toLocaleString()}</span>
                      </div>

                      {promoApplied && (
                        <div className="flex justify-between text-green-500">
                          <span>Promo ({promoCode.toUpperCase()})</span>
                          <span>−₦{discount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                        <span className="text-primary-theme">Total</span>
                        <span className="text-orange-500">
                          ₦{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ─── PAYMENT ─── */}
              {step === "payment" && (
                <section>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-primary-theme">
                    <CreditCard size={20} className="text-orange-400" /> Payment
                  </h2>

                  <p className="text-muted-theme text-sm mb-6">
                    Secure payment powered by Paystack
                  </p>

                  {/* ORDER SUMMARY */}
                  <div className="surface-primary border rounded-2xl p-4 mb-4 flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-theme text-xs mb-0.5">
                        Order total
                      </p>
                      <p className="font-bold text-2xl text-orange-500">
                        ₦{total.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right text-muted-theme text-xs space-y-1">
                      <p>
                        {cart.length} item{cart.length !== 1 ? "s" : ""}
                      </p>
                      <p>{selectedRate?.name}</p>
                      <p>Delivering to {address.city}</p>
                    </div>
                  </div>

                  {/* PAYMENT CARD */}
                  <div className="surface-primary border rounded-2xl overflow-hidden">
                    {/* HEADER */}
                    <div className="p-5 border-b border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                          <CreditCard size={18} className="text-sky-500" />
                        </div>

                        <div>
                          <p className="font-semibold text-sm text-primary-theme">
                            Pay with Paystack
                          </p>
                          <p className="text-xs text-muted-theme">
                            Card, Bank Transfer, USSD, QR
                          </p>
                        </div>

                        <span className="ml-auto text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full">
                          Recommended
                        </span>
                      </div>

                      <p className="text-xs text-muted-theme mb-4">
                        You&apos;ll be securely redirected to Paystack. Your
                        card details are never stored on our servers.
                      </p>

                      {/* PAY BUTTON */}
                      <button
                        onClick={handlePaystack}
                        disabled={paystackLoading}
                        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {paystackLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating your order…
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} />
                            Pay ₦{total.toLocaleString()} with Paystack
                          </>
                        )}
                      </button>

                      <p className="text-center text-[10px] text-muted-theme mt-3">
                        By clicking above you agree to our Terms of Service
                      </p>
                    </div>

                    {/* TRUST BADGES */}
                    <div className="p-4 grid grid-cols-3 gap-3">
                      {[
                        {
                          icon: <ShieldCheck size={14} />,
                          text: "256-bit SSL",
                        },
                        {
                          icon: <CheckCircle2 size={14} />,
                          text: "PCI Compliant",
                        },
                        { icon: <Globe size={14} />, text: "CBN Licensed" },
                      ].map((b) => (
                        <div
                          key={b.text}
                          className="flex items-center gap-2 text-xs text-muted-theme"
                        >
                          <span className="text-green-500">{b.icon}</span>
                          {b.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between pt-2">
                {stepIndex > 0 ? (
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-2 text-muted-theme hover:text-primary-theme transition-colors text-sm px-4 py-2.5 rounded-xl border border-border hover:border-border-strong surface-primary"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {(step === "cart" ||
                  step === "address" ||
                  step === "shipping") && (
                  <button
                    onClick={goNext}
                    disabled={
                      (step === "cart" && cart.length === 0) ||
                      (step === "address" && !addressValid()) ||
                      (step === "shipping" && !shippingValid())
                    }
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
                  >
                    Continue <ArrowLeft size={14} className="rotate-180" />
                  </button>
                )}

                {step === "review" && (
                  <button
                    onClick={goNext}
                    className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-glow"
                  >
                    <CreditCard size={14} /> Proceed to Payment
                  </button>
                )}
              </div>
            </div>

            {/* ── Order Summary sidebar ── */}
            <aside className="sticky top-24 space-y-4">

  {/* ORDER SUMMARY CARD */}
  <div className="surface-primary border rounded-2xl p-5">
    <h3 className="font-bold mb-4 text-primary-theme">Order Summary</h3>

    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
      {cart.map((item) => (
        <div
          key={item.productId}
          className="flex items-center gap-2.5 py-1.5"
        >
          <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-surface">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          <p className="text-xs flex-1 leading-tight line-clamp-2 text-muted-theme">
            {item.name}
          </p>

          <p className="text-xs font-semibold shrink-0 text-primary-theme">
            ×{item.quantity}
          </p>
        </div>
      ))}
    </div>

    {/* TOTALS */}
    <div className="border-t border-border pt-4 space-y-2.5 text-sm">

      <div className="flex justify-between text-muted-theme">
        <span>Subtotal</span>
        <span>₦{subtotal.toLocaleString()}</span>
      </div>

      <div className="flex justify-between text-muted-theme">
        <span>Shipping</span>
        <span>
          {shippingCost === 0 ? (
            <span className="text-muted-theme">TBD</span>
          ) : (
            `₦${shippingCost.toLocaleString()}`
          )}
        </span>
      </div>

      {promoApplied && (
        <div className="flex justify-between text-green-500">
          <span>Promo (AUTOBRIDGE10)</span>
          <span>−₦{discount.toLocaleString()}</span>
        </div>
      )}

      <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
        <span className="text-primary-theme">Total</span>
        <span className="text-orange-500">
          ₦{total.toLocaleString()}
        </span>
      </div>
    </div>
  </div>

  {/* TRUST BADGES */}
  <div className="surface-primary border rounded-2xl p-4 space-y-2.5 text-xs text-muted-theme">

    <div className="flex items-center gap-2">
      <ShieldCheck size={13} className="text-green-500 shrink-0" />
      Buyer protection on all orders
    </div>

    <div className="flex items-center gap-2">
      <Globe size={13} className="text-yellow-500 shrink-0" />
      DHL delivery — local & international
    </div>

    <div className="flex items-center gap-2">
      <Truck size={13} className="text-blue-500 shrink-0" />
      Real-time tracking after dispatch
    </div>

    <div className="flex items-center gap-2">
      <CreditCard size={13} className="text-sky-500 shrink-0" />
      Paystack secured payment
    </div>

  </div>

</aside>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

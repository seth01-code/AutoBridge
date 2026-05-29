"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import {
  CheckCircle2,
  Package,
  MapPin,
  Truck,
  CreditCard,
  Copy,
  Loader2,
  AlertCircle,
  Clock,
  Globe,
  Zap,
  ShieldCheck,
  Home,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type OrderItem = {
  productId: string;
  name: string;
  image: string;
  vendor: string;
  price: number;
  quantity: number;
  weight: number;
};

type Address = {
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

type Shipping = {
  rateId: string;
  carrier: "dhl" | "standard" | "express";
  name: string;
  price: number;
  eta: string;
  dhlProductCode?: string;
  trackingNumber?: string;
  labelUrl?: string;
  shippedAt?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  address: Address;
  shipping: Shipping;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  promoCode: string;
  paymentMethod: string;
  paystackRef: string;
  paystackStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    description: string;
  }
> = {
  pending_payment: {
    label: "Pending Payment",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    description: "Awaiting payment confirmation",
  },
  paid: {
    label: "Payment Confirmed",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    description: "Your payment was received successfully",
  },
  processing: {
    label: "Processing",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "Your order is being prepared",
  },
  shipped: {
    label: "Shipped",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    description: "Your order is on the way",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    description: "Order delivered successfully",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    description: "This order was cancelled",
  },
  refunded: {
    label: "Refunded",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    description: "Your refund has been processed",
  },
};

/* ─────────────────────────────────────────────
   TIMELINE STEPS
───────────────────────────────────────────── */
const TIMELINE = [
  { key: "paid", label: "Order Placed", icon: <CreditCard size={14} /> },
  { key: "processing", label: "Processing", icon: <Package size={14} /> },
  { key: "shipped", label: "Shipped", icon: <Truck size={14} /> },
  { key: "delivered", label: "Delivered", icon: <CheckCircle2 size={14} /> },
];

const STATUS_ORDER = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
];

function getTimelineProgress(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

/* ─────────────────────────────────────────────
   CARRIER ICON
───────────────────────────────────────────── */
function CarrierIcon({ carrier }: { carrier: Shipping["carrier"] }) {
  if (carrier === "dhl") return <Globe size={15} className="text-yellow-400" />;
  if (carrier === "express")
    return <Zap size={15} className="text-orange-400" />;
  return <Truck size={15} className="text-blue-400" />;
}

/* ─────────────────────────────────────────────
   FORMAT DATE
───────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-orange-400"
      title="Copy"
    >
      {copied ? (
        <CheckCircle2 size={13} className="text-green-400" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/checkout/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message ?? "Order not found");
        setOrder(data.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-primary-theme">
          <div className="w-16 h-16 rounded-2xl bg-primary-light border border-[var(--primary-border)] flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
          <p className="text-muted-theme text-sm">Loading your order…</p>
        </div>
      </>
    );
  }

  /* ── ERROR ── */
  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-primary-theme px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-primary-theme">
              Order Not Found
            </h2>
            <p className="text-muted-theme text-sm max-w-xs">
              {error ||
                "We couldn't find this order. It may have been removed or the link is incorrect."}
            </p>
          </div>

          <Link
            href="/marketplace"
            className="bg-primary hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            Back to Marketplace
          </Link>
        </div>
      </>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["paid"];
  const timelineProgress = getTimelineProgress(order.status);
  const isCancelledOrRefunded =
    order.status === "cancelled" || order.status === "refunded";

  return (
    <>
      <Navbar />

      {/* ✅ FIX: min-h-screen wrapper now correctly wraps ALL content */}
      <div className="min-h-screen bg-background text-primary-theme pb-20">

        {/* ── Hero success banner ── */}
        <div className="bg-surface border-b border-[var(--border)]">
          <div className="max-w-3xl mx-auto px-6 py-12 text-center">
            {/* Animated checkmark ring */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping opacity-30" />
              <div className="relative w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-primary-theme">
              Order Confirmed!
            </h1>

            <p className="text-muted-theme text-base max-w-sm mx-auto">
              Thank you, {order.address.fullName.split(" ")[0]}. Your order has
              been placed and payment received.
            </p>

            {/* Order number pill */}
            <div className="inline-flex items-center gap-2 mt-5 bg-surface-secondary border border-[var(--border)] rounded-full px-5 py-2.5 text-sm">
              <span className="text-muted-theme">Order</span>
              <span className="font-bold text-orange-400">
                {order.orderNumber}
              </span>
              <CopyButton value={order.orderNumber} />
            </div>

            <p className="text-muted-theme text-xs mt-3">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-3xl mx-auto px-6 pt-10 space-y-5">

          {/* ── Status badge ── */}
          <div className="flex items-center gap-3 bg-surface border border-[var(--border)] rounded-2xl px-5 py-4">
            {/* ICON WRAPPER */}
            <div className="w-9 h-9 rounded-xl bg-surface-secondary border border-[var(--border)] flex items-center justify-center">
              <Package size={16} className={statusCfg.color} />
            </div>

            {/* STATUS TEXT */}
            <div>
              <p className={`font-semibold text-sm ${statusCfg.color}`}>
                {statusCfg.label}
              </p>
              <p className="text-muted-theme text-xs mt-0.5">
                {statusCfg.description}
              </p>
            </div>

            {/* PAYSTACK REFERENCE */}
            <div className="ml-auto text-right">
              <p className="text-muted-theme text-xs">Paystack ref</p>
              <div className="flex items-center gap-1 justify-end">
                <p className="text-sm font-mono text-primary-theme max-w-[140px] truncate">
                  {order.paystackRef}
                </p>
                <CopyButton value={order.paystackRef} />
              </div>
            </div>
          </div>

          {/* ── Order timeline (only for non-cancelled) ── */}
          {!isCancelledOrRefunded && (
            <div className="bg-surface border border-[var(--border)] rounded-2xl p-5">
              <p className="text-xs text-muted-theme uppercase tracking-widest mb-5">
                Order Progress
              </p>

              <div className="relative flex items-start justify-between">
                {/* Background line */}
                <div className="absolute top-5 left-5 right-5 h-px bg-[var(--border)]" />

                {/* Progress line */}
                <div
                  className="absolute top-5 left-5 h-px bg-orange-500/50 transition-all duration-700"
                  style={{
                    width: `${
                      (timelineProgress / (TIMELINE.length - 1)) *
                      (100 - 10 / TIMELINE.length)
                    }%`,
                  }}
                />

                {TIMELINE.map((step, i) => {
                  const isActive = i < timelineProgress;
                  return (
                    <div
                      key={step.key}
                      className="relative flex flex-col items-center gap-2 z-10"
                      style={{ width: `${100 / TIMELINE.length}%` }}
                    >
                      {/* STEP ICON */}
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                            : "bg-surface-secondary border-[var(--border)] text-muted-theme"
                        }`}
                      >
                        {step.icon}
                      </div>

                      {/* LABEL */}
                      <p
                        className={`text-[10px] text-center leading-tight ${
                          isActive ? "text-primary-theme" : "text-muted-theme"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Tracking number (if shipped) ── */}
          {order.shipping.trackingNumber && (
            <div className="bg-surface border border-[var(--border)] rounded-2xl p-5 flex items-center gap-4">
              {/* ICON */}
              <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-[var(--border)] flex items-center justify-center shrink-0">
                <Truck size={18} className="text-cyan-500" />
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-theme">
                  Tracking Number
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="font-mono text-sm text-muted-theme truncate">
                    {order.shipping.trackingNumber}
                  </p>
                  <CopyButton value={order.shipping.trackingNumber} />
                </div>
              </div>

              {/* SHIPPED DATE */}
              {order.shipping.shippedAt && (
                <p className="text-xs text-muted-theme shrink-0">
                  Shipped {formatDate(order.shipping.shippedAt)}
                </p>
              )}
            </div>
          )}

          {/* ── Items ── */}
          <div className="bg-surface border border-[var(--border)] rounded-2xl overflow-hidden">
            {/* HEADER */}
            <div className="px-5 pt-5 pb-3 border-b border-[var(--border)] flex items-center justify-between">
              <p className="text-xs text-muted-theme uppercase tracking-widest">
                Items ({order.items.length})
              </p>
              <p className="text-xs text-muted-theme">
                {order.items.reduce((a, i) => a + i.quantity, 0)} unit(s)
              </p>
            </div>

            {/* ITEMS LIST */}
            <div className="divide-y divide-[var(--border)]">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors"
                >
                  {/* IMAGE */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-secondary shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-muted-theme" />
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-theme truncate">
                      {item.vendor || "Marketplace Vendor"}
                    </p>
                    <p className="font-medium text-sm leading-snug mt-0.5 truncate text-primary-theme">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-theme mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* PRICE */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-orange-400">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-theme">
                        ₦{item.price.toLocaleString()} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="px-5 py-4 border-t border-[var(--border)] space-y-2.5 text-sm bg-surface">
              <div className="flex justify-between text-muted-theme">
                <span>Subtotal</span>
                <span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-theme">
                <span>Shipping ({order.shipping.name})</span>
                <span>₦{order.shippingCost.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>
                    Discount {order.promoCode && `(${order.promoCode})`}
                  </span>
                  <span>−₦{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
                <span>Total Paid</span>
                <span className="text-orange-400">
                  ₦{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ── Two-column: Delivery + Shipping ── */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* ── DELIVERY ADDRESS ── */}
            <div className="bg-surface border border-[var(--border)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-orange-400" />
                <p className="text-xs text-muted-theme uppercase tracking-widest">
                  Delivery Address
                </p>
              </div>

              <p className="font-semibold text-sm text-primary-theme">
                {order.address.fullName}
              </p>

              <div className="mt-2 space-y-1 text-sm text-muted-theme">
                <p>{order.address.address}</p>
                <p>
                  {[order.address.city, order.address.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>
                  {order.address.country}
                  {order.address.postalCode
                    ? ` — ${order.address.postalCode}`
                    : ""}
                </p>
                {order.address.landmark && (
                  <p className="text-xs text-muted-theme">
                    Near: {order.address.landmark}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-1">
                <p className="text-xs text-muted-theme">{order.address.email}</p>
                <p className="text-xs text-muted-theme">{order.address.phone}</p>
              </div>
            </div>

            {/* ── SHIPPING METHOD ── */}
            <div className="bg-surface border border-[var(--border)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={14} className="text-orange-400" />
                <p className="text-xs text-muted-theme uppercase tracking-widest">
                  Shipping Method
                </p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <CarrierIcon carrier={order.shipping.carrier} />
                <p className="font-semibold text-sm text-primary-theme">
                  {order.shipping.name}
                </p>
                {order.shipping.carrier === "dhl" && (
                  <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full">
                    DHL
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-theme">
                <Clock size={11} />
                <span>Est. {order.shipping.eta || "3–5 business days"}</span>
              </div>

              <p className="text-orange-400 font-bold text-sm mt-3">
                ₦{order.shippingCost.toLocaleString()}
              </p>

              {!order.shipping.trackingNumber && !isCancelledOrRefunded && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-muted-theme leading-relaxed">
                    A tracking number will be sent to{" "}
                    <span className="text-primary-theme">
                      {order.address.email}
                    </span>{" "}
                    once your order is dispatched.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── What's next ── */}
          {!isCancelledOrRefunded && (
            <div className="bg-white dark:bg-[#0F1A2E] border border-gray-200 dark:border-white/8 rounded-2xl p-5">
              <p className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-widest mb-4">
                What Happens Next
              </p>

              <div className="space-y-3">
                {[
                  {
                    icon: (
                      <ShieldCheck
                        size={14}
                        className="text-green-500 dark:text-green-400"
                      />
                    ),
                    title: "Payment verified",
                    desc: "Your Paystack payment has been confirmed.",
                    done: true,
                  },
                  {
                    icon: (
                      <Package
                        size={14}
                        className="text-blue-500 dark:text-blue-400"
                      />
                    ),
                    title: "Order preparation",
                    desc: "Our vendor will pick and pack your items within 24 hours.",
                    done: order.status !== "paid",
                  },
                  {
                    icon: (
                      <Truck
                        size={14}
                        className="text-cyan-500 dark:text-cyan-400"
                      />
                    ),
                    title: "Dispatch & tracking",
                    desc: `You'll receive a tracking number via ${order.address.email} once shipped.`,
                    done: ["shipped", "delivered"].includes(order.status),
                  },
                  {
                    icon: (
                      <CheckCircle2
                        size={14}
                        className="text-orange-500 dark:text-orange-400"
                      />
                    ),
                    title: "Delivery",
                    desc: `Expected delivery: ${
                      order.shipping.eta || "3–5 business days"
                    }.`,
                    done: order.status === "delivered",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition ${
                        step.done
                          ? "bg-gray-100 dark:bg-white/10"
                          : "bg-gray-100 dark:bg-white/5 opacity-50"
                      }`}
                    >
                      {step.icon}
                    </div>

                    <div className={step.done ? "" : "opacity-50"}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                        {step.desc}
                      </p>
                    </div>

                    {step.done && (
                      <CheckCircle2
                        size={13}
                        className="text-green-500 dark:text-green-400 mt-1 ml-auto shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/marketplace"
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/8 text-gray-900 dark:text-white font-medium py-3.5 rounded-xl transition-colors"
            >
              <Home size={16} />
              Go to Home
            </Link>
          </div>

          {/* ── Support note ── */}
          <p className="text-center text-xs text-gray-400 dark:text-white/25 pb-4">
            Need help? Contact support with your order number{" "}
            <span className="text-orange-500/80 dark:text-orange-400/70 font-medium">
              {order.orderNumber}
            </span>
          </p>

        </div>{/* end max-w-3xl */}

      </div>{/* end min-h-screen */}
      <Footer/>
    </>
  );
}
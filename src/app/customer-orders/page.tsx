"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  Search,
  ArrowRight,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getUser } from "../../lib/auth";

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
};

type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  address: {
    fullName: string;
    city: string;
    state: string;
    country: string;
  };
  shipping: {
    name: string;
    trackingNumber?: string;
    eta?: string;
  };
  total: number;
  shippingCost: number;
  subtotal: number;
  status: string;
  createdAt: string;
};

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; progress: number }
> = {
  pending_payment: { label: "Pending Payment", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20", progress: 5 },
  paid:            { label: "Payment Confirmed", color: "bg-green-500/20 text-green-400 border-green-500/20", progress: 20 },
  processing:      { label: "Processing",        color: "bg-blue-500/20 text-blue-400 border-blue-500/20",   progress: 40 },
  shipped:         { label: "In Transit",         color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20",   progress: 72 },
  delivered:       { label: "Delivered",          color: "bg-green-500/20 text-green-400 border-green-500/20", progress: 100 },
  cancelled:       { label: "Cancelled",          color: "bg-red-500/20 text-red-400 border-red-500/20",     progress: 0 },
  refunded:        { label: "Refunded",           color: "bg-purple-500/20 text-purple-400 border-purple-500/20", progress: 0 },
};

const FILTER_OPTIONS = [
  "All Orders",
  "Payment Confirmed",
  "Processing",
  "In Transit",
  "Delivered",
  "Cancelled",
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatPrice(n: number) {
  return `₦${n.toLocaleString()}`;
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function OrdersPage() {
  const [orders,  setOrders ] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState("");
  const [search,  setSearch ] = useState("");
  const [filter,  setFilter ] = useState("All Orders");

  /* ── Fetch real orders ── */
  useEffect(() => {
    const user = getUser();
    if (!user?.id) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }

    fetch(`/api/checkout?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message ?? "Failed to load orders");
        setOrders(data.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ── Filter + search ── */
  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const cfg        = STATUS_CONFIG[order.status];
      const statusLabel = cfg?.label ?? order.status;

      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.vendor.toLowerCase().includes(search.toLowerCase())
        ) ||
        (order.shipping.trackingNumber ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All Orders" || statusLabel === filter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:      orders.length,
    inTransit:  orders.filter((o) => o.status === "shipped").length,
    delivered:  orders.filter((o) => o.status === "delivered").length,
    processing: orders.filter((o) => ["paid", "processing"].includes(o.status)).length,
  }), [orders]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center gap-3 text-white">
          <Loader2 size={24} className="animate-spin text-orange-400" />
          <span className="text-white/50">Loading your orders…</span>
        </div>
      </>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-4 text-white px-6">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-white/60 text-sm text-center max-w-xs">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0B1120] text-white">

        {/* ── Hero ── */}
        <div className="border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="text-orange-400 text-sm font-medium mb-3">
                  Customer Dashboard
                </p>
                <h1 className="text-4xl font-bold">Your Orders</h1>
                <p className="text-white/50 mt-4 max-w-2xl leading-relaxed">
                  Track shipments, monitor delivery progress, and manage all
                  your AutoBridge purchases in one place.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-[420px]">
                <StatCard icon={<Package size={18} />}    title="Total Orders" value={String(stats.total)} />
                <StatCard icon={<Truck size={18} />}      title="In Transit"   value={String(stats.inTransit)} />
                <StatCard icon={<CheckCircle2 size={18}/>} title="Delivered"   value={String(stats.delivered)} />
                <StatCard icon={<Clock3 size={18} />}     title="Processing"   value={String(stats.processing)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Search + filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="relative w-full lg:max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, products, tracking…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {FILTER_OPTIONS.map((f) => (
                <FilterButton
                  key={f}
                  label={f}
                  active={filter === f}
                  onClick={() => setFilter(f)}
                />
              ))}
            </div>
          </div>

          <div className="mb-6 text-sm text-white/40">
            Showing {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </div>

          {/* Orders list */}
          {filtered.length === 0 ? (
            <div className="border border-white/10 rounded-3xl p-16 text-center bg-white/[0.02]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Package className="text-orange-400" size={28} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No Orders Found</h3>
              <p className="text-white/50 max-w-md mx-auto mb-6">
                {orders.length === 0
                  ? "You haven't placed any orders yet."
                  : "No orders match your current search or filter."}
              </p>
              {orders.length === 0 && (
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl text-sm font-medium transition"
                >
                  Browse Marketplace <ArrowRight size={15} />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((order) => {
                const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["paid"];
                const firstItem = order.items[0];
                const extraCount = order.items.length - 1;

                return (
                  <div
                    key={order._id}
                    className="group bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/20 transition"
                  >
                    <div className="grid lg:grid-cols-[160px_1fr_auto] gap-6 p-6">

                      {/* Product image */}
                      <div className="relative h-[140px] rounded-2xl overflow-hidden bg-white/5 shrink-0">
                        {firstItem?.image ? (
                          <Image
                            src={firstItem.image}
                            alt={firstItem.name}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} className="text-white/20" />
                          </div>
                        )}
                        {extraCount > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                            +{extraCount} more
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-white/30 text-xs">
                              {order.orderNumber}
                            </span>
                            <span className="text-white/20 text-xs">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>

                          <h2 className="text-lg font-semibold leading-snug truncate">
                            {firstItem?.name ?? "Order"}
                            {extraCount > 0 && (
                              <span className="text-white/40 font-normal text-sm ml-2">
                                + {extraCount} item{extraCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </h2>

                          <p className="text-white/50 text-sm mt-1">
                            {firstItem?.vendor ?? "AutoBridge Vendor"}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-white/40 mt-3">
                            <MapPin size={13} />
                            {order.shipping.trackingNumber
                              ? `Tracking: ${order.shipping.trackingNumber}`
                              : "Tracking number pending"}
                          </div>
                        </div>

                        {/* Bottom row */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-5">
                          <div>
                            <p className="text-2xl font-bold">
                              {formatPrice(order.total)}
                            </p>
                            <p className="text-sm text-white/40 mt-0.5">
                              {order.shipping.eta
                                ? `Est. ${order.shipping.eta}`
                                : `Via ${order.shipping.name}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              href={`/order-confirmation/${order._id}`}
                              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition"
                            >
                              View Order
                            </Link>
                            {order.shipping.trackingNumber && (
                              <Link
                                href={`/tracker?tracking=${order.shipping.trackingNumber}`}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 transition text-sm font-medium"
                              >
                                Track Order <ArrowRight size={15} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress sidebar */}
                      <div className="hidden xl:flex flex-col items-end justify-between shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-white/40">Shipment Progress</p>
                          <p className="font-medium mt-1">{cfg.progress}%</p>
                        </div>
                        <div className="w-[180px]">
                          <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                            <span>Delivery Status</span>
                            <span>{cfg.progress}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all duration-700"
                              style={{ width: `${cfg.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function StatCard({
  icon, title, value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
          {icon}
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-white/50 mt-4">{title}</p>
    </div>
  );
}

function FilterButton({
  label, active, onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm border transition whitespace-nowrap ${
        active
          ? "bg-orange-500 border-orange-500"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
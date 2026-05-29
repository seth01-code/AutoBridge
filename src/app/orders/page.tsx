"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import AppShell from "../layouts/AppShell";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  ShoppingCart, Search, Eye, Truck, CheckCircle2, Clock3,
  Package, XCircle, Download, ChevronRight, Loader2, Tag,
  MapPin, Phone, Mail, Globe, FileText, ExternalLink,
  RefreshCw, AlertCircle,
} from "lucide-react";
import { getUser } from "../../lib/auth";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type OrderStatus =
  | "pending_payment" | "paid" | "processing"
  | "shipped" | "delivered" | "cancelled" | "refunded";

type DBOrder = {
  _id: string;
  orderNumber: string;
  userId: string;
  items: {
    productId: string; name: string; image: string;
    vendor: string; price: number; quantity: number; weight: number;
  }[];
  address: {
    fullName: string; email: string; phone: string;
    country: string; state: string; city: string;
    address: string; postalCode: string; landmark?: string;
  };
  shipping: {
    rateId: string; carrier: string; name: string;
    price: number; eta: string; dhlProductCode?: string;
    trackingNumber?: string; labelUrl?: string; shippedAt?: string;
  };
  subtotal: number; shippingCost: number; discount: number; total: number;
  status: OrderStatus; paystackRef: string; createdAt: string;
};

type ShipmentForm = {
  addressLine1: string; city: string; postalCode: string;
  countryCode: string; recipientName: string; recipientPhone: string;
  recipientEmail: string; declaredValueUSD: number;
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function statusLabel(s: OrderStatus): string {
  return ({
    pending_payment: "Pending Payment", paid: "Paid",
    processing: "Processing", shipped: "Shipped",
    delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded",
  } as Record<OrderStatus, string>)[s] ?? s;
}

function statusStyle(s: OrderStatus): string {
  return ({
    pending_payment: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    paid:            "bg-blue-500/20 text-blue-400 border-blue-500/30",
    processing:      "bg-purple-500/20 text-purple-400 border-purple-500/30",
    shipped:         "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    delivered:       "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled:       "bg-red-500/20 text-red-400 border-red-500/30",
    refunded:        "bg-orange-500/20 text-orange-400 border-orange-500/30",
  } as Record<OrderStatus, string>)[s] ?? "bg-white/10 text-white/60 border-white/10";
}

function fmt(d: string) {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
}

const COUNTRY_TO_ISO: Record<string, string> = {
  Nigeria:"NG", Ghana:"GH", Kenya:"KE", "South Africa":"ZA",
  "United Kingdom":"GB", "United States":"US",
  Canada:"CA", Germany:"DE", France:"FR", UAE:"AE",
};

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-orange-500/50";

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function VendorOrdersPage() {
  const userRef = useRef(getUser());
  const user    = userRef.current;

  const [orders, setOrders]               = useState<DBOrder[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [filter, setFilter]               = useState<OrderStatus | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [showShipForm, setShowShipForm]   = useState(false);
  const [shipLoading, setShipLoading]     = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const [shipForm, setShipForm] = useState<ShipmentForm>({
    addressLine1: "", city: "", postalCode: "", countryCode: "NG",
    recipientName: "", recipientPhone: "", recipientEmail: "", declaredValueUSD: 50,
  });

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = "/api/orders?";

      if (user.role === "admin") {
        url += "role=admin";
      } else if (user.role === "vendor") {
        const vn = (user as any).vendorName ?? (user as any).name ?? "";
        if (!vn) {
          setError("Vendor name is not set on your account. Contact an admin.");
          setLoading(false);
          return;
        }
        url += `vendorName=${encodeURIComponent(vn)}`;
      } else {
        url += `userId=${encodeURIComponent(user.id)}`;
      }

      const res  = await fetch(url);
      const json = await res.json();

      if (!json.success) throw new Error(json.message ?? "Failed to load orders");
      setOrders(json.data ?? []);
    } catch (e: any) {
      setError(e.message);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!selectedOrder) return;
    const a = selectedOrder.address;
    setShipForm({
      addressLine1:     a.address,
      city:             a.city,
      postalCode:       a.postalCode,
      countryCode:      COUNTRY_TO_ISO[a.country] ?? "NG",
      recipientName:    a.fullName,
      recipientPhone:   a.phone,
      recipientEmail:   a.email,
      declaredValueUSD: Math.round(selectedOrder.subtotal / 1600),
    });
  }, [selectedOrder]);

  /* ─────────────────────────────────────────
     FILTERS
  ───────────────────────────────────────── */
  const filteredOrders = useMemo(() => orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.address.fullName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || o.status === filter;
    return matchSearch && matchFilter;
  }), [orders, search, filter]);

  /* ─────────────────────────────────────────
     UPDATE STATUS
  ───────────────────────────────────────── */
  async function updateStatus(orderId: string, status: OrderStatus, extra?: Record<string, any>) {
    setStatusLoading(orderId);
    try {
      const res  = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const patch = (o: DBOrder): DBOrder =>
        o._id !== orderId ? o : {
          ...o, status,
          shipping: { ...o.shipping, ...(extra ?? {}) },
        };

      setOrders((prev) => prev.map(patch));
      setSelectedOrder((prev) => prev ? patch(prev) : prev);
      toast.success(`Order marked as ${statusLabel(status)}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setStatusLoading(null);
    }
  }

  /* ─────────────────────────────────────────
     CREATE DHL SHIPMENT
  ───────────────────────────────────────── */
  async function createShipment() {
    if (!selectedOrder) return;
    setShipLoading(true);
    try {
      const totalWeightKg = selectedOrder.items.reduce(
        (acc, i) => acc + (i.weight ?? 0.5) * i.quantity, 0,
      );

      const res = await fetch("/api/shipping/dhl/shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId:          selectedOrder._id,
          recipientName:    shipForm.recipientName,
          recipientPhone:   shipForm.recipientPhone,
          recipientEmail:   shipForm.recipientEmail,
          addressLine1:     shipForm.addressLine1,
          city:             shipForm.city,
          postalCode:       shipForm.postalCode,
          countryCode:      shipForm.countryCode,
          totalWeightKg,
          declaredValueUSD: shipForm.declaredValueUSD,
          items: selectedOrder.items.map((i) => ({
            description: i.name,
            quantity:    i.quantity,
          })),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const { trackingNumber, labelUrl } = json;

      await updateStatus(selectedOrder._id, "shipped", {
        trackingNumber,
        labelUrl,
        shippedAt: new Date().toISOString(),
      });

      toast.success(`Shipment created! Tracking: ${trackingNumber}`);
      setShowShipForm(false);
      setSelectedOrder(null);
    } catch (e: any) {
      toast.error(`Shipment failed: ${e.message}`);
    } finally {
      setShipLoading(false);
    }
  }

  /* ─────────────────────────────────────────
     STATS
  ───────────────────────────────────────── */
  const stats = useMemo(() => ({
    total:      orders.length,
    paid:       orders.filter((o) => o.status === "paid").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped:    orders.filter((o) => o.status === "shipped").length,
    delivered:  orders.filter((o) => o.status === "delivered").length,
  }), [orders]);

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <AppShell>
      <div className="min-h-screen bg-[#0B1120] text-white p-4 sm:p-6">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Vendor Orders</h1>
            <p className="text-white/50 mt-2">
              Manage customer purchases, fulfilment and DHL shipping
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders} disabled={loading}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-3 rounded-2xl flex items-center gap-2 text-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total",      value: stats.total,      icon: <ShoppingCart size={18}/> },
            { label: "Paid",       value: stats.paid,       icon: <Tag size={18}/> },
            { label: "Processing", value: stats.processing, icon: <Package size={18}/> },
            { label: "Shipped",    value: stats.shipped,    icon: <Truck size={18}/> },
            { label: "Delivered",  value: stats.delivered,  icon: <CheckCircle2 size={18}/> },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/40 text-sm">{s.label}</p>
                <span className="text-orange-400">{s.icon}</span>
              </div>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6">
          <div className="relative w-full lg:w-[380px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or customer name…"
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-orange-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["All","paid","processing","shipped","delivered","cancelled"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s as any)}
                className={`px-4 py-2 rounded-xl border text-sm transition capitalize ${
                  filter === s
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {s === "All" ? "All" : statusLabel(s as OrderStatus)}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-white/40">
            <Loader2 size={24} className="animate-spin text-orange-400" />
            Loading orders…
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 mb-6">
            <AlertCircle size={16}/> {error}
          </div>
        )}

        {/* ORDERS LIST */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredOrders.length === 0 && (
              <div className="text-center py-24 text-white/30">No orders found</div>
            )}

            {filteredOrders.map((order) => (
              <div key={order._id}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                        <ShoppingCart size={22}/>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-semibold">{order.orderNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs border ${statusStyle(order.status)}`}>
                            {statusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-white/40 text-sm mt-1">
                          {order.address.fullName} · {fmt(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                      <InfoItem label="Items"    value={`${order.items.length} product(s)`} />
                      <InfoItem label="Shipping" value={order.shipping.name} />
                      <InfoItem label="Total"    value={`₦${order.total.toLocaleString()}`} />
                      <InfoItem
                        label="Tracking"
                        value={order.shipping.trackingNumber || "—"}
                        highlight={!!order.shipping.trackingNumber}
                      />
                    </div>
                  </div>

                  {/* RIGHT — actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => { setSelectedOrder(order); setShowShipForm(false); }}
                      className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
                      title="View order"
                    >
                      <Eye size={16}/>
                    </button>

                    {order.status === "paid" && (
                      <button
                        disabled={statusLoading === order._id}
                        onClick={() => updateStatus(order._id, "processing")}
                        className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-sm flex items-center gap-2 transition disabled:opacity-40"
                      >
                        {statusLoading === order._id
                          ? <Loader2 size={13} className="animate-spin"/> : <CheckCircle2 size={13}/>}
                        Approve
                      </button>
                    )}

                    {(order.status === "paid" || order.status === "processing") && (
                      <button
                        disabled={statusLoading === order._id}
                        onClick={() => { if (confirm("Cancel this order?")) updateStatus(order._id, "cancelled"); }}
                        className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm flex items-center gap-2 transition disabled:opacity-40"
                      >
                        <XCircle size={13}/> Cancel
                      </button>
                    )}

                    {order.status === "processing" && (
                      <button
                        onClick={() => { setSelectedOrder(order); setShowShipForm(true); }}
                        className="px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-sm flex items-center gap-2 transition"
                      >
                        <Truck size={13}/> Ship
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        disabled={statusLoading === order._id}
                        onClick={() => updateStatus(order._id, "delivered")}
                        className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-sm flex items-center gap-2 transition disabled:opacity-40"
                      >
                        {statusLoading === order._id
                          ? <Loader2 size={13} className="animate-spin"/> : <CheckCircle2 size={13}/>}
                        Delivered
                      </button>
                    )}

                    {/* ✅ FIX 1: /tracker (was /tracking) */}
                    {order.shipping.trackingNumber && (
                      <Link
                        href={`/tracker?tracking=${order.shipping.trackingNumber}`}
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-sm flex items-center gap-2 transition"
                      >
                        <ExternalLink size={13}/> Track
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════ ORDER DETAIL MODAL ═══════ */}
      {selectedOrder && !showShipForm && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div className="w-full max-w-3xl bg-[#111827] border border-white/10 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold">{selectedOrder.orderNumber}</h2>
                <p className="text-white/40 text-sm mt-1">
                  Placed {fmt(selectedOrder.createdAt)} ·{" "}
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${statusStyle(selectedOrder.status)}`}>
                    {statusLabel(selectedOrder.status)}
                  </span>
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
              >✕</button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Items */}
              <Section title="Items">
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-white/40">{item.vendor} · Qty {item.quantity} · {item.weight}kg each</p>
                      </div>
                      <p className="text-sm font-semibold text-orange-400 shrink-0">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Customer */}
              <Section title="Customer">
                <div className="grid sm:grid-cols-2 gap-3">
                  <ModalCard icon={<Tag size={13}/>}   label="Name"    value={selectedOrder.address.fullName}/>
                  <ModalCard icon={<Mail size={13}/>}  label="Email"   value={selectedOrder.address.email}/>
                  <ModalCard icon={<Phone size={13}/>} label="Phone"   value={selectedOrder.address.phone}/>
                  <ModalCard icon={<Globe size={13}/>} label="Country" value={selectedOrder.address.country}/>
                  <ModalCard
                    icon={<MapPin size={13}/>}
                    label="Address"
                    value={`${selectedOrder.address.address}, ${selectedOrder.address.city}, ${selectedOrder.address.state}`}
                    className="sm:col-span-2"
                  />
                </div>
              </Section>

              {/* Shipping */}
              <Section title="Shipping">
                <div className="grid sm:grid-cols-2 gap-3">
                  <ModalCard icon={<Truck size={13}/>}    label="Method"   value={selectedOrder.shipping.name}/>
                  <ModalCard icon={<Clock3 size={13}/>}   label="ETA"      value={selectedOrder.shipping.eta || "—"}/>
                  <ModalCard
                    icon={<FileText size={13}/>}
                    label="Tracking #"
                    value={selectedOrder.shipping.trackingNumber || "Not yet assigned"}
                    highlight={!!selectedOrder.shipping.trackingNumber}
                  />
                  <ModalCard icon={<Tag size={13}/>} label="Shipping cost" value={`₦${selectedOrder.shipping.price.toLocaleString()}`}/>
                </div>

                {selectedOrder.shipping.labelUrl && (
                  <a
                    href={selectedOrder.shipping.labelUrl} target="_blank" rel="noreferrer"
                    download={`label-${selectedOrder.orderNumber}.pdf`}
                    className="mt-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 px-4 py-3 rounded-xl text-sm transition w-fit"
                  >
                    <Download size={14}/> Download DHL Label (PDF)
                  </a>
                )}

                {/* ✅ FIX 2: /tracker (was /tracking) */}
                {selectedOrder.shipping.trackingNumber && (
                  <Link
                    href={`/tracker?tracking=${selectedOrder.shipping.trackingNumber}`} target="_blank"
                    className="mt-2 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 px-4 py-3 rounded-xl text-sm transition w-fit"
                  >
                    <ExternalLink size={14}/> View Live Tracking
                  </Link>
                )}
              </Section>

              {/* Financials */}
              <Section title="Financials">
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Subtotal", value: `₦${selectedOrder.subtotal.toLocaleString()}` },
                    { label: "Shipping", value: `₦${selectedOrder.shippingCost.toLocaleString()}` },
                    { label: "Discount", value: selectedOrder.discount ? `−₦${selectedOrder.discount.toLocaleString()}` : "—" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-white/50">
                      <span>{r.label}</span><span>{r.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-orange-400">₦{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </Section>

              {/* Modal actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedOrder.status === "paid" && (
                  <button disabled={statusLoading === selectedOrder._id}
                    onClick={() => updateStatus(selectedOrder._id, "processing")}
                    className="px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-sm flex items-center gap-2 disabled:opacity-40"
                  >
                    {statusLoading === selectedOrder._id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                    Approve Order
                  </button>
                )}
                {selectedOrder.status === "processing" && (
                  <button onClick={() => setShowShipForm(true)}
                    className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm flex items-center gap-2"
                  >
                    <Truck size={14}/> Create DHL Shipment
                  </button>
                )}
                {selectedOrder.status === "shipped" && (
                  <button disabled={statusLoading === selectedOrder._id}
                    onClick={() => updateStatus(selectedOrder._id, "delivered")}
                    className="px-5 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-sm flex items-center gap-2 disabled:opacity-40"
                  >
                    <CheckCircle2 size={14}/> Mark as Delivered
                  </button>
                )}
                {(selectedOrder.status === "paid" || selectedOrder.status === "processing") && (
                  <button disabled={statusLoading === selectedOrder._id}
                    onClick={() => { if (confirm("Cancel this order?")) updateStatus(selectedOrder._id, "cancelled"); }}
                    className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm flex items-center gap-2 disabled:opacity-40"
                  >
                    <XCircle size={14}/> Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ DHL SHIPMENT MODAL ═══════ */}
      {selectedOrder && showShipForm && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowShipForm(false); }}
        >
          <div className="w-full max-w-2xl bg-[#111827] border border-white/10 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Truck size={18} className="text-orange-400"/> Create DHL Shipment
                </h2>
                <p className="text-white/40 text-sm mt-1">
                  {selectedOrder.orderNumber} · Verify recipient details before dispatching
                </p>
              </div>
              <button onClick={() => setShowShipForm(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
              >✕</button>
            </div>

            <div className="mx-6 mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400 flex items-start gap-2 shrink-0">
              <AlertCircle size={13} className="mt-0.5 shrink-0"/>
              Address fields below are for records only. DHL dispatches from the AutoBridge Lagos origin.
              Recipient details are sent to DHL as entered.
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              <p className="text-xs text-white/40 uppercase tracking-widest">Recipient Details</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <input value={shipForm.recipientName}
                    onChange={(e) => setShipForm({...shipForm, recipientName: e.target.value})}
                    placeholder="John Doe" className={inputCls}/>
                </Field>
                <Field label="Phone *">
                  <input value={shipForm.recipientPhone}
                    onChange={(e) => setShipForm({...shipForm, recipientPhone: e.target.value})}
                    placeholder="+234 800 000 0000" className={inputCls}/>
                </Field>
                <Field label="Email" className="sm:col-span-2">
                  <input value={shipForm.recipientEmail}
                    onChange={(e) => setShipForm({...shipForm, recipientEmail: e.target.value})}
                    placeholder="customer@email.com" className={inputCls}/>
                </Field>
              </div>

              <p className="text-xs text-white/40 uppercase tracking-widest pt-2">
                Delivery Address{" "}
                <span className="normal-case text-white/20">(for records · does not affect DHL routing)</span>
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Street Address" className="sm:col-span-2">
                  <input value={shipForm.addressLine1}
                    onChange={(e) => setShipForm({...shipForm, addressLine1: e.target.value})}
                    placeholder="123 Main St" className={inputCls}/>
                </Field>
                <Field label="City">
                  <input value={shipForm.city}
                    onChange={(e) => setShipForm({...shipForm, city: e.target.value})}
                    placeholder="Lagos" className={inputCls}/>
                </Field>
                <Field label="Postal Code">
                  <input value={shipForm.postalCode}
                    onChange={(e) => setShipForm({...shipForm, postalCode: e.target.value})}
                    placeholder="100001" className={inputCls}/>
                </Field>
                <Field label="Country Code (ISO)">
                  <input value={shipForm.countryCode} maxLength={2}
                    onChange={(e) => setShipForm({...shipForm, countryCode: e.target.value.toUpperCase().slice(0,2)})}
                    placeholder="NG" className={inputCls}/>
                </Field>
                <Field label="Declared Value (USD)">
                  <input type="number" min={1} value={shipForm.declaredValueUSD}
                    onChange={(e) => setShipForm({...shipForm, declaredValueUSD: Number(e.target.value)})}
                    className={inputCls}/>
                </Field>
              </div>

              {/* Package summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm space-y-1">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Package Summary</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-white/60">
                    <span className="truncate">{item.name} ×{item.quantity}</span>
                    <span>{((item.weight ?? 0.5) * item.quantity).toFixed(2)} kg</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t border-white/10 text-white">
                  <span>Total weight</span>
                  <span>
                    {selectedOrder.items.reduce((a,i) => a+(i.weight??0.5)*i.quantity,0).toFixed(2)} kg
                  </span>
                </div>
              </div>

              <button
                onClick={createShipment}
                disabled={shipLoading || !shipForm.recipientName || !shipForm.recipientPhone}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                {shipLoading
                  ? <><Loader2 size={16} className="animate-spin"/> Creating shipment…</>
                  : <><Truck size={16}/> Create DHL Shipment & Mark Shipped</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

/* ─────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────── */
function Field({ label, children, className="" }: { label:string; children:React.ReactNode; className?:string }) {
  return (
    <div className={className}>
      <label className="block text-xs text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}
function InfoItem({ label, value, highlight=false }: { label:string; value:string; highlight?:boolean }) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className={`font-medium text-sm truncate ${highlight ? "text-cyan-400" : ""}`}>{value}</p>
    </div>
  );
}
function ModalCard({ icon, label, value, highlight=false, className="" }: {
  icon:React.ReactNode; label:string; value:string; highlight?:boolean; className?:string;
}) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-2">{icon}{label}</div>
      <p className={`text-sm font-medium ${highlight ? "text-cyan-400" : ""}`}>{value}</p>
    </div>
  );
}
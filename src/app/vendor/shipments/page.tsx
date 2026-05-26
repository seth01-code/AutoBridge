"use client";

import { useMemo, useState } from "react";
import AppShell from "../../layouts/AppShell";
import {
  Truck,
  Search,
  PackageCheck,
  MapPin,
  Clock,
  XCircle,
  CheckCircle2,
  RefreshCcw,
  Package,
  CalendarDays,
} from "lucide-react";

/* ================= TYPES ================= */

type ShipmentStatus =
  | "Label Created"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

type Shipment = {
  shipmentId: string;
  orderId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  service: string;
  estimatedDelivery: string;
  createdAt: string;
};

/* ================= MOCK DATA ================= */

const MOCK_SHIPMENTS: Shipment[] = [
  {
    shipmentId: "SHIP-10001",
    orderId: "ORD-7781",
    trackingNumber: "DHL983123456",
    status: "Label Created",
    service: "DHL Express",
    estimatedDelivery: "3–5 days",
    createdAt: new Date().toISOString(),
  },
  {
    shipmentId: "SHIP-10002",
    orderId: "ORD-7782",
    trackingNumber: "DHL123889912",
    status: "In Transit",
    service: "DHL Express",
    estimatedDelivery: "2–4 days",
    createdAt: new Date().toISOString(),
  },
  {
    shipmentId: "SHIP-10003",
    orderId: "ORD-7783",
    trackingNumber: "DHL445667788",
    status: "Delivered",
    service: "DHL Express",
    estimatedDelivery: "Delivered",
    createdAt: new Date().toISOString(),
  },
];

/* ================= PAGE ================= */

export default function VendorShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ShipmentStatus | "All">("All");

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return shipments.filter((s) => {
      const matchesSearch =
        s.shipmentId.toLowerCase().includes(q) ||
        s.orderId.toLowerCase().includes(q) ||
        s.trackingNumber.toLowerCase().includes(q);

      const matchesFilter = filter === "All" || s.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [shipments, search, filter]);

  /* ================= STATUS UPDATE ================= */

  function updateStatus(id: string, status: ShipmentStatus) {
    setShipments((prev) =>
      prev.map((s) => (s.shipmentId === id ? { ...s, status } : s))
    );
  }

  /* ================= STATS ================= */

  const stats = useMemo(() => {
    return {
      total: shipments.length,
      delivered: shipments.filter((s) => s.status === "Delivered").length,
      inTransit: shipments.filter((s) => s.status === "In Transit").length,
      pending: shipments.filter((s) => s.status === "Label Created").length,
    };
  }, [shipments]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0B1120] text-white p-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shipments</h1>
            <p className="text-white/50 mt-2">
              AutoBridge logistics & delivery tracking
            </p>
          </div>

          <button
            onClick={() => setShipments(MOCK_SHIPMENTS)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10"
          >
            <RefreshCcw size={16} />
            Reset
          </button>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat title="Total" value={stats.total} icon={<Package />} />
          <Stat title="Delivered" value={stats.delivered} icon={<CheckCircle2 />} />
          <Stat title="In Transit" value={stats.inTransit} icon={<Truck />} />
          <Stat title="Pending" value={stats.pending} icon={<Clock />} />
        </div>

        {/* ================= SEARCH + FILTER ================= */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative w-full lg:w-[380px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shipment, order, tracking..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "Label Created",
              "In Transit",
              "Out for Delivery",
              "Delivered",
              "Cancelled",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-4 py-2 rounded-xl border text-sm transition ${
                  filter === s
                    ? "bg-orange-500 border-orange-500"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ================= LIST ================= */}
        <div className="space-y-4">
          {filtered.map((s) => (
            <div
              key={s.shipmentId}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row justify-between gap-4"
            >

              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Truck className="text-orange-400" />
                </div>

                <div>
                  <h3 className="font-semibold">{s.shipmentId}</h3>
                  <p className="text-white/40 text-sm">
                    Order: {s.orderId} • {s.trackingNumber}
                  </p>
                </div>
              </div>

              {/* MIDDLE */}
              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{s.service}</span>
                </div>

                <div className="flex items-center gap-1">
                  <CalendarDays size={14} />
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{s.estimatedDelivery}</span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <select
                  value={s.status}
                  onChange={(e) =>
                    updateStatus(s.shipmentId, e.target.value as ShipmentStatus)
                  }
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                >
                  <option>Label Created</option>
                  <option>In Transit</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>

                {statusIcon(s.status)}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-white/40 py-20">
              No shipments found
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* ================= STAT CARD ================= */

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-sm">{title}</span>
        <div className="text-orange-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}

/* ================= STATUS ICON ================= */

function statusIcon(status: ShipmentStatus) {
  switch (status) {
    case "Delivered":
      return <CheckCircle2 className="text-green-400" />;
    case "Cancelled":
      return <XCircle className="text-red-400" />;
    default:
      return <PackageCheck className="text-orange-400" />;
  }
}
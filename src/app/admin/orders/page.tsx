"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminService } from "../../../lib/admin/adminService";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Eye,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await AdminService.getOrders();
      setOrders(data);
      setLoading(false);
    }

    load();
  }, []);

  /* ================= FILTERED ================= */

  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        const matchFilter = filter === "all" || o.status === filter;

        const matchSearch =
          o.customer.toLowerCase().includes(search.toLowerCase()) ||
          o.vendor.toLowerCase().includes(search.toLowerCase()) ||
          o.tracking.toLowerCase().includes(search.toLowerCase());

        return matchFilter && matchSearch;
      })
      .sort((a, b) => b.amount - a.amount);
  }, [orders, filter, search]);

  /* ================= STATS ================= */

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const processing = orders.filter((o) => o.status === "processing").length;
  const transit = orders.filter((o) => o.status === "in_transit").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Orders Control Center</h1>
        <p className="text-white/50 text-sm">
          Manage fulfillment, tracking, and revenue operations
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Revenue" value={`$${totalRevenue}`} icon="💰" />
        <Stat label="Processing" value={processing} icon={<Clock size={16} />} />
        <Stat label="In Transit" value={transit} icon={<Truck size={16} />} />
        <Stat label="Delivered" value={delivered} icon={<CheckCircle2 size={16} />} />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, customer, vendor, tracking..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <option value="all">All Orders</option>
          <option value="processing">Processing</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {filtered.map((o) => (
          <div
            key={o.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              {/* LEFT */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Package className="text-orange-400" size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">{o.customer}</h2>

                  <p className="text-sm text-white/50">
                    Vendor: {o.vendor}
                  </p>

                  <p className="text-xs text-white/30">
                    Tracking: {o.tracking}
                  </p>

                  <span
                    className={`inline-block mt-2 text-xs px-2 py-1 rounded border ${
                      o.status === "delivered"
                        ? "text-green-400 border-green-500/30 bg-green-500/10"
                        : o.status === "in_transit"
                        ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                        : o.status === "processing"
                        ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                        : "text-red-400 border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center justify-between lg:justify-end gap-6">

                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">
                    ${o.amount}
                  </p>
                  <p className="text-xs text-white/40">Order value</p>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
                    <Eye size={14} />
                  </button>

                  <button className="px-3 py-2 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl">
                    Manage
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STATS ================= */

function Stat({ label, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-sm">{label}</span>
        <span className="text-orange-400">{icon}</span>
      </div>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
    </div>
  );
}
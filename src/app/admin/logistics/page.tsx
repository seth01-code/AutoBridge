"use client";

import { useMemo, useState } from "react";
import { shipments as initialShipments } from "../mock/adminData";
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  ArrowUpRight,
} from "lucide-react";

type Carrier = "DHL" | "FedEx" | "UPS" | "Local Courier" | "Unassigned";

export default function LogisticsPage() {
  const [data, setData] = useState(initialShipments);
  const [search, setSearch] = useState("");
  const [carrierFilter, setCarrierFilter] = useState<Carrier | "All">("All");

  /* ================= ADVANCE SHIPMENT ================= */

  const updateProgress = (tracking: string) => {
    setData((prev) =>
      prev.map((s) =>
        s.tracking === tracking
          ? {
              ...s,
              progress: Math.min(100, s.progress + 10),
              status: s.progress + 10 >= 100 ? "Delivered" : "In Transit",
            }
          : s,
      ),
    );
  };

  /* ================= ASSIGN CARRIER ================= */

  const assignCarrier = (tracking: string, carrier: Carrier) => {
    setData((prev) =>
      prev.map((s) => (s.tracking === tracking ? { ...s, carrier } : s)),
    );
  };

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return data.filter((s) => {
      const matchSearch =
        s.tracking.toLowerCase().includes(search.toLowerCase()) ||
        s.status.toLowerCase().includes(search.toLowerCase());

      const matchCarrier =
        carrierFilter === "All" || s.carrier === carrierFilter;

      return matchSearch && matchCarrier;
    });
  }, [data, search, carrierFilter]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Logistics Control Tower</h1>
        <p className="text-white/50 text-sm">
          Manage shipments, carriers, and delivery pipelines
        </p>
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking, status..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2"
          />
        </div>

        {/* FILTER */}
        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <option value="All">All Carriers</option>
          <option value="DHL">DHL</option>
          <option value="FedEx">FedEx</option>
          <option value="UPS">UPS</option>
          <option value="Local Courier">Local Courier</option>
          <option value="Unassigned">Unassigned</option>
        </select>

        {/* NEW CARRIER BUTTON (future modal hook) */}
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 rounded-xl">
          <Plus size={16} />
          Add Carrier
        </button>
      </div>

      {/* SHIPMENTS GRID */}
      <div className="grid gap-4">
        {filtered.map((s) => (
          <div
            key={s.tracking}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
          >
            {/* TOP */}
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              {/* LEFT INFO */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className="text-orange-400" size={18} />
                  <span className="font-semibold">{s.tracking}</span>
                </div>

                <p className="text-white/50 text-sm flex items-center gap-2">
                  <Package size={14} />
                  Status: <span className="text-white">{s.status}</span>
                </p>

                <p className="text-white/40 text-xs flex items-center gap-2">
                  <MapPin size={12} />
                  Carrier: {s.carrier || "Unassigned"}
                </p>

                <p className="text-white/40 text-xs flex items-center gap-2">
                  <Clock size={12} />
                  ETA: {s.eta || "Pending"}
                </p>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex flex-col items-end gap-3">
                {/* PROGRESS */}
                <div className="w-[200px]">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Progress</span>
                    <span>{s.progress}%</span>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProgress(s.tracking)}
                    className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-xl hover:bg-white/10"
                  >
                    Advance
                  </button>

                  <button className="px-3 py-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl">
                    Dispatch
                  </button>
                </div>
              </div>
            </div>

            {/* CARRIER ASSIGNMENT */}
            <div className="mt-4 flex flex-wrap gap-2">
              {["DHL", "FedEx", "UPS", "Local Courier"].map((c) => (
                <button
                  key={c}
                  onClick={() => assignCarrier(s.tracking, c as Carrier)}
                  className={`px-3 py-1 text-xs rounded-xl border transition ${
                    s.carrier === c
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  Assign {c}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

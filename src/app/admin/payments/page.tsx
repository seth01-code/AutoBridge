"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const payments = [
    { id: "p1", amount: 249, type: "vendor payout", status: "pending" },
    { id: "p2", amount: 119, type: "platform fee", status: "completed" },
    { id: "p3", amount: 520, type: "vendor payout", status: "failed" },
    { id: "p4", amount: 89, type: "refund", status: "completed" },
    { id: "p5", amount: 1020, type: "platform fee", status: "processing" },
  ];

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.type.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ? true : p.status === filter;

      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  /* ================= STATS ================= */

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const pending = payments.filter((p) => p.status === "pending").length;
  const completed = payments.filter((p) => p.status === "completed").length;
  const failed = payments.filter((p) => p.status === "failed").length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Payments Control Center</h1>
        <p className="text-white/50 text-sm">
          Monitor payouts, fees, refunds, and financial flow
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Stat
          label="Total Volume"
          value={`$${totalRevenue}`}
          icon={<DollarSign size={16} />}
        />

        <Stat
          label="Pending"
          value={pending}
          icon={<Clock size={16} />}
        />

        <Stat
          label="Completed"
          value={completed}
          icon={<CheckCircle2 size={16} />}
        />

        <Stat
          label="Failed"
          value={failed}
          icon={<XCircle size={16} />}
        />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row gap-3">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments, type, ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
          >
            <div className="flex flex-col lg:flex-row justify-between gap-4">

              {/* LEFT */}
              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <CreditCard className="text-orange-400" size={18} />
                </div>

                <div>
                  <h2 className="font-semibold capitalize">{p.type}</h2>
                  <p className="text-xs text-white/40">{p.id}</p>

                  <span
                    className={`inline-block mt-2 text-xs px-2 py-1 rounded border ${
                      p.status === "completed"
                        ? "text-green-400 border-green-500/30 bg-green-500/10"
                        : p.status === "pending"
                        ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                        : p.status === "processing"
                        ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                        : "text-red-400 border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right flex flex-col items-end gap-2">

                <p className="text-xl font-bold text-green-400">
                  ${p.amount}
                </p>

                <p className="text-xs text-white/40">Transaction amount</p>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  {p.status === "pending" && (
                    <button className="px-3 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl">
                      Approve
                    </button>
                  )}

                  {p.status === "failed" && (
                    <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl">
                      Retry
                    </button>
                  )}

                  <button className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-xl">
                    View
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
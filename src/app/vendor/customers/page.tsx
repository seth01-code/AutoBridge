"use client";

import { useMemo, useState } from "react";
import AppShell from "../../layouts/AppShell";
import {
  Search,
  Users,
  ShoppingCart,
  DollarSign,
  Star,
  UserCheck,
} from "lucide-react";

/* ================= TYPES ================= */

type Order = {
  id: string;
  customer: string;
  total: number;
  createdAt: string;
};

type Customer = {
  name: string;
  totalSpent: number;
  orders: number;
  lastOrder: string;
  status: "New" | "Returning" | "VIP Potential";
};

/* ================= MOCK ORDERS (replace later with API) ================= */

const orders: Order[] = [
  { id: "1", customer: "Ayo Daniels", total: 245000, createdAt: "2026-05-20" },
  { id: "2", customer: "Ayo Daniels", total: 120000, createdAt: "2026-05-21" },
  { id: "3", customer: "Chioma N", total: 430000, createdAt: "2026-05-22" },
  { id: "4", customer: "Tunde K", total: 76000, createdAt: "2026-05-23" },
  { id: "5", customer: "Chioma N", total: 190000, createdAt: "2026-05-24" },
  { id: "6", customer: "David O", total: 310000, createdAt: "2026-05-25" },
];

/* ================= ENGINE ================= */

function buildCustomers(orders: Order[]): Customer[] {
  const map: Record<string, Customer> = {};

  orders.forEach((o) => {
    if (!map[o.customer]) {
      map[o.customer] = {
        name: o.customer,
        totalSpent: 0,
        orders: 0,
        lastOrder: o.createdAt,
        status: "New",
      };
    }

    map[o.customer].totalSpent += o.total;
    map[o.customer].orders += 1;

    if (new Date(o.createdAt) > new Date(map[o.customer].lastOrder)) {
      map[o.customer].lastOrder = o.createdAt;
    }
  });

  return Object.values(map).map((c) => {
    let status: Customer["status"] = "New";

    if (c.orders >= 3) status = "Returning";
    if (c.totalSpent >= 500000) status = "VIP Potential";

    return { ...c, status };
  });
}

/* ================= PAGE ================= */

export default function VendorCustomersPage() {
  const [search, setSearch] = useState("");

  const customers = useMemo(() => buildCustomers(orders), []);

  const filtered = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  /* ================= METRICS ================= */

  const stats = useMemo(() => {
    return {
      totalCustomers: customers.length,
      returning: customers.filter((c) => c.status === "Returning").length,
      vip: customers.filter((c) => c.status === "VIP Potential").length,
    };
  }, [customers]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0B1120] text-white p-6">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-white/50 mt-2">
              AutoBridge vendor customer intelligence
            </p>
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Stat title="Total Customers" value={stats.totalCustomers} icon={<Users />} />
          <Stat title="Returning" value={stats.returning} icon={<UserCheck />} />
          <Stat title="VIP Potential" value={stats.vip} icon={<Star />} />
        </div>

        {/* ================= SEARCH ================= */}
        <div className="relative w-full lg:w-[380px] mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        {/* ================= LIST ================= */}
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row justify-between gap-4"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Users className="text-orange-400" />
                </div>

                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-white/40 text-sm">
                    {c.orders} orders • Last: {c.lastOrder}
                  </p>
                </div>
              </div>

              {/* MIDDLE */}
              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <ShoppingCart size={14} />
                  <span>{c.orders}</span>
                </div>

                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>₦{c.totalSpent.toLocaleString()}</span>
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${
                    c.status === "VIP Potential"
                      ? "border-yellow-400 text-yellow-300"
                      : c.status === "Returning"
                      ? "border-green-400 text-green-300"
                      : "border-white/20 text-white/60"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-white/40 py-20">
              No customers found
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
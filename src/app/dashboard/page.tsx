"use client";

import AppShell from "../layouts/AppShell";
import {
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";

/* ================= MOCK DATA ================= */

const ORDERS = [
  { id: "ORD-10001", status: "Pending", total: 45000 },
  { id: "ORD-10002", status: "Delivered", total: 120000 },
  { id: "ORD-10003", status: "Processing", total: 60000 },
  { id: "ORD-10004", status: "Shipped", total: 90000 },
  { id: "ORD-10005", status: "Delivered", total: 35000 },
];

const PRODUCTS = [
  { name: "Wireless Headphones", sales: 120 },
  { name: "Smart Watch", sales: 98 },
  { name: "Gaming Keyboard", sales: 75 },
  { name: "Bluetooth Speaker", sales: 60 },
];

/* ================= COMPONENT ================= */

export default function VendorDashboard() {
  const totalRevenue = useMemo(() => {
    return ORDERS.reduce((sum, o) => sum + o.total, 0);
  }, []);

  const pendingOrders = ORDERS.filter(
    (o) => o.status === "Pending",
  ).length;

  const deliveredOrders = ORDERS.filter(
    (o) => o.status === "Delivered",
  ).length;

  return (
    <AppShell>
      <div className="p-6 space-y-8 text-white bg-[#0B1120] min-h-screen">

        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-3xl font-bold">
            Vendor Dashboard
          </h1>
          <p className="text-white/50 mt-1">
            Manage your store performance in real time
          </p>
        </div>

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <KpiCard
            icon={<DollarSign />}
            label="Revenue"
            value={`₦${totalRevenue.toLocaleString()}`}
          />

          <KpiCard
            icon={<ShoppingBag />}
            label="Total Orders"
            value={ORDERS.length}
          />

          <KpiCard
            icon={<Clock />}
            label="Pending Orders"
            value={pendingOrders}
          />

          <KpiCard
            icon={<Package />}
            label="Delivered"
            value={deliveredOrders}
          />
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ================= RECENT ORDERS ================= */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-4">
              Recent Orders
            </h2>

            <div className="space-y-3">
              {ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-white/5 p-3 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-xs text-white/50">
                      {order.status}
                    </p>
                  </div>

                  <div className="font-semibold text-orange-400">
                    ₦{order.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= TOP PRODUCTS ================= */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-4">
              Top Products
            </h2>

            <div className="space-y-4">
              {PRODUCTS.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="text-white/50">
                      {p.sales}
                    </span>
                  </div>

                  <div className="w-full bg-white/10 h-2 rounded-full mt-2">
                    <div
                      className="h-2 bg-orange-500 rounded-full"
                      style={{
                        width: `${(p.sales / 120) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= SALES INSIGHT ================= */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-orange-400" />
            Sales Overview
          </h2>

          <div className="grid grid-cols-7 gap-2 h-40 items-end">
            {[40, 70, 55, 90, 60, 75, 100].map((h, i) => (
              <div
                key={i}
                className="bg-orange-500/60 rounded-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}

/* ================= KPI CARD ================= */

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
      <div className="text-orange-400">{icon}</div>

      <div>
        <p className="text-white/50 text-sm">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
"use client";

import AppShell from "@/app/layouts/AppShell";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/* ================= MOCK ORDER DATA ================= */

const orders = [
  { id: 1, total: 245000, customer: "A", source: "Organic Search" },
  { id: 2, total: 120000, customer: "B", source: "Direct Traffic" },
  { id: 3, total: 430000, customer: "C", source: "Social Media" },
  { id: 4, total: 76000, customer: "D", source: "Organic Search" },
  { id: 5, total: 190000, customer: "E", source: "Ads Campaigns" },
  { id: 6, total: 310000, customer: "F", source: "Organic Search" },
];

/* ================= ANALYTICS ENGINE ================= */

const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

const totalOrders = orders.length;

const uniqueCustomers = new Set(orders.map((o) => o.customer)).size;

const refundRate = 1.2;

/* traffic calculation */
const trafficMap = orders.reduce((acc: any, o) => {
  acc[o.source] = (acc[o.source] || 0) + 1;
  return acc;
}, {});

const trafficSources = Object.entries(trafficMap).map(([key, value]) => ({
  label: key,
  value: Number(value),
  percent: Math.round((Number(value) / orders.length) * 100),
}));

/* ================= UI DATA ================= */

const analyticsCards = [
  {
    title: "Revenue",
    value: `₦${totalRevenue.toLocaleString()}`,
    growth: "+12.4%",
    positive: true,
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: totalOrders.toString(),
    growth: "+8.1%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: uniqueCustomers.toString(),
    growth: "+4.3%",
    positive: true,
    icon: Users,
  },
  {
    title: "Refund Rate",
    value: `${refundRate}%`,
    growth: "-0.4%",
    positive: false,
    icon: TrendingUp,
  },
];

/* ================= TOP PRODUCTS MOCK ================= */

const topProducts = [
  { name: "Premium Headphones", sales: 420, revenue: "₦1.8M" },
  { name: "Gaming Keyboard", sales: 310, revenue: "₦920K" },
  { name: "Smart Watch", sales: 280, revenue: "₦1.2M" },
  { name: "Bluetooth Speaker", sales: 190, revenue: "₦540K" },
];

export default function VendorAnalyticsPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#0B1120] text-white p-6">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vendor Analytics</h1>
            <p className="text-white/50 mt-2">
              Real-time performance overview of your store
            </p>
          </div>

          <div className="flex gap-2">
            {["7D", "30D", "90D", "1Y"].map((item) => (
              <button
                key={item}
                className="px-4 py-2 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {analyticsCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Icon className="text-orange-400" size={22} />
                  </div>

                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      card.positive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {card.positive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    {card.growth}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-white/50 text-sm">{card.title}</p>
                  <h2 className="text-3xl font-bold mt-1">{card.value}</h2>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* SALES CHART (STATIC VISUAL FOR NOW) */}
          <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">
              Revenue Overview
            </h2>

            <div className="h-[320px] flex items-end gap-3">
              {[45, 70, 55, 90, 65, 85, 75, 100, 80, 92, 60, 110].map(
                (h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-xl"
                      style={{ height: `${h * 2}px` }}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* TOP PRODUCTS */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Top Products</h2>

            <div className="space-y-5">
              {topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex justify-between items-center"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                      {i + 1}
                    </div>

                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-white/40 text-xs">
                        {p.sales} sales
                      </p>
                    </div>
                  </div>

                  <div className="font-semibold">{p.revenue}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* TRAFFIC SOURCES (FIXED) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">
              Traffic Sources
            </h2>

            <div className="space-y-5">
              {trafficSources.map((t) => (
                <div key={t.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t.label}</span>
                    <span className="text-white/50">
                      {t.percent}%
                    </span>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONVERSION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">
              Conversion Metrics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                ["Conversion Rate", "6.8%"],
                ["Cart Abandonment", "18%"],
                ["Returning Customers", "42%"],
                ["Avg Order Value", "₦84K"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white/5 rounded-2xl p-5 border border-white/10"
                >
                  <p className="text-white/50 text-sm">{label}</p>
                  <h3 className="text-2xl font-bold mt-2">{value}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
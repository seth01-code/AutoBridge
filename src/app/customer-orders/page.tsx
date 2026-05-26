"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";

import Navbar from "../components/layout/Navbar";

const orders = [
  {
    id: "AB-20394",
    product: "Wireless Noise Cancelling Headphones",
    vendor: "TechNova Store",
    price: "₦50,000",
    status: "In Transit",
    progress: 72,
    statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    eta: "Arriving May 29",
    tracking: "DHL-999999",
  },

  {
    id: "AB-20395",
    product: "Premium Leather Backpack",
    vendor: "Urban Carry",
    price: "₦250,000",
    status: "Delivered",
    progress: 100,
    statusColor: "bg-green-500/20 text-green-400 border-green-500/20",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    eta: "Delivered May 21",
    tracking: "DHL-123456",
  },

  {
    id: "AB-20396",
    product: "Mechanical Gaming Keyboard",
    vendor: "NextCore Gaming",
    price: "₦373,000",
    status: "Processing",
    progress: 22,
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1200&auto=format&fit=crop",
    eta: "Preparing shipment",
    tracking: "Pending",
  },

  {
    id: "AB-20397",
    product: "Smart Fitness Watch",
    vendor: "PulseWear",
    price: "₦82,000",
    status: "Out for Delivery",
    progress: 92,
    statusColor: "bg-orange-500/20 text-orange-400 border-orange-500/20",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    eta: "Delivering today",
    tracking: "DHL-888222",
  },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Orders");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.product.toLowerCase().includes(search.toLowerCase()) ||
        order.vendor.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.tracking.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All Orders" || order.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0B1120] text-white">
        {/* ================= HERO ================= */}
        <div className="border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="text-orange-400 text-sm font-medium mb-3">
                  Customer Dashboard
                </p>

                <h1 className="text-4xl font-bold">Your Orders</h1>

                <p className="text-white/50 mt-4 max-w-2xl leading-relaxed">
                  Track shipments, monitor delivery progress, download invoices,
                  and manage all your AutoBridge purchases in one place.
                </p>
              </div>

              {/* QUICK STATS */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-[420px]">
                <StatCard
                  icon={<Package size={18} />}
                  title="Total Orders"
                  value="24"
                />

                <StatCard
                  icon={<Truck size={18} />}
                  title="In Transit"
                  value="3"
                />

                <StatCard
                  icon={<CheckCircle2 size={18} />}
                  title="Delivered"
                  value="18"
                />

                <StatCard
                  icon={<Clock3 size={18} />}
                  title="Processing"
                  value="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* SEARCH + FILTERS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            {/* SEARCH */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, products, tracking..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <FilterButton
                label="All Orders"
                active={filter === "All Orders"}
                onClick={() => setFilter("All Orders")}
              />

              <FilterButton
                label="Processing"
                active={filter === "Processing"}
                onClick={() => setFilter("Processing")}
              />

              <FilterButton
                label="In Transit"
                active={filter === "In Transit"}
                onClick={() => setFilter("In Transit")}
              />

              <FilterButton
                label="Out for Delivery"
                active={filter === "Out for Delivery"}
                onClick={() => setFilter("Out for Delivery")}
              />

              <FilterButton
                label="Delivered"
                active={filter === "Delivered"}
                onClick={() => setFilter("Delivered")}
              />
            </div>
          </div>

          {/* RESULTS */}
          <div className="mb-6 text-sm text-white/40">
            Showing {filteredOrders.length} order
            {filteredOrders.length !== 1 ? "s" : ""}
          </div>

          {/* ORDERS */}
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="group bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/20 transition"
              >
                <div className="grid lg:grid-cols-[160px_1fr_auto] gap-6 p-6">
                  {/* IMAGE */}
                  <div className="relative h-[140px] rounded-2xl overflow-hidden">
                    <Image
                      src={order.image}
                      alt={order.product}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${order.statusColor}`}
                        >
                          {order.status}
                        </span>

                        <span className="text-white/30 text-xs">
                          Order #{order.id}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold">
                        {order.product}
                      </h2>

                      <p className="text-white/50 text-sm mt-2">
                        Sold by {order.vendor}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-white/40 mt-4">
                        <MapPin size={14} />
                        Tracking: {order.tracking}
                      </div>
                    </div>

                    {/* BOTTOM */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mt-6">
                      <div>
                        <p className="text-2xl font-bold">{order.price}</p>

                        <p className="text-sm text-white/40 mt-1">
                          {order.eta}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition">
                          Invoice
                        </button>

                        <Link
                          href={`/tracker?tracking=${order.tracking}`}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 transition text-sm font-medium"
                        >
                          Track Order
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* STATUS SIDE */}
                  <div className="hidden xl:flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="text-xs text-white/40">
                        Shipment Progress
                      </p>

                      <p className="font-medium mt-1">{order.progress}%</p>
                    </div>

                    <div className="w-[180px]">
                      <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                        <span>Delivery Status</span>

                        <span>{order.progress}%</span>
                      </div>

                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{
                            width: `${order.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredOrders.length === 0 && (
            <div className="border border-white/10 rounded-3xl p-16 text-center bg-white/[0.02]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Package className="text-orange-400" />
              </div>

              <h3 className="text-2xl font-semibold mb-3">
                No Orders Found
              </h3>

              <p className="text-white/50 max-w-md mx-auto">
                We could not find any orders matching your current search or
                filter.
              </p>
            </div>
          )}

          {/* LOAD MORE */}
          {filteredOrders.length > 0 && (
            <div className="flex justify-center mt-10">
              <button className="px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition">
                Load More Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  icon,
  title,
  value,
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
  label,
  active,
  onClick,
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
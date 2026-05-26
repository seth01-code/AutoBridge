"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../layouts/AppShell";
import { toast } from "react-toastify";

import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  Clock3,
  Package,
  XCircle,
  Download,
  ChevronRight,
} from "lucide-react";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type PaymentStatus = "Paid" | "Pending" | "Refunded";

type Order = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  items: number;
  status: OrderStatus;
  payment: PaymentStatus;
  createdAt: string;
  shippingAddress: string;
};

type Shipment = {
  shipmentId: string;
  orderId: string;
  trackingNumber: string;
  status: string;
  service: string;
  estimatedDelivery: string;
  createdAt: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-23091",
    customer: "Michael Johnson",
    email: "michael@example.com",
    phone: "+234 812 000 0001",
    total: 245000,
    items: 3,
    status: "Processing",
    payment: "Paid",
    createdAt: "2026-05-21",
    shippingAddress: "Lekki Phase 1, Lagos",
  },
  {
    id: "ORD-23092",
    customer: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+234 812 000 0002",
    total: 89000,
    items: 1,
    status: "Pending",
    payment: "Pending",
    createdAt: "2026-05-22",
    shippingAddress: "Wuse 2, Abuja",
  },
  {
    id: "ORD-23093",
    customer: "Daniel Peters",
    email: "daniel@example.com",
    phone: "+234 812 000 0003",
    total: 430000,
    items: 5,
    status: "Shipped",
    payment: "Paid",
    createdAt: "2026-05-23",
    shippingAddress: "GRA, Port Harcourt",
  },
  {
    id: "ORD-23094",
    customer: "Jessica Adams",
    email: "jessica@example.com",
    phone: "+234 812 000 0004",
    total: 120000,
    items: 2,
    status: "Delivered",
    payment: "Paid",
    createdAt: "2026-05-23",
    shippingAddress: "Ibadan, Oyo",
  },
  {
    id: "ORD-23095",
    customer: "Chris Thompson",
    email: "chris@example.com",
    phone: "+234 812 000 0005",
    total: 76000,
    items: 1,
    status: "Cancelled",
    payment: "Refunded",
    createdAt: "2026-05-20",
    shippingAddress: "Enugu, Nigeria",
  },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<OrderStatus | "All">("All");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem("shipments");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("shipments", JSON.stringify(shipments));
  }, [shipments]);

  /* ================= FILTER ================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" ? true : order.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  /* ================= STATUS COLORS ================= */

  function getStatusStyle(status: OrderStatus) {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/20";

      case "Processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/20";

      case "Packed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/20";

      case "Shipped":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/20";

      case "Delivered":
        return "bg-green-500/20 text-green-400 border-green-500/20";

      case "Cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/20";
    }
  }

  function paymentStyle(payment: PaymentStatus) {
    switch (payment) {
      case "Paid":
        return "text-green-400";

      case "Pending":
        return "text-yellow-400";

      case "Refunded":
        return "text-red-400";
    }
  }

  /* ================= UPDATE STATUS ================= */

  function updateOrderStatus(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  }

  function createShipment(order: Order) {
    if (order.status === "Cancelled") {
      toast.error("Cannot create shipment for cancelled order");
      return;
    }

    const tracking = `DHL${Math.floor(Math.random() * 999999999)}`;

    const newShipment: Shipment = {
      shipmentId: `SHIP-${Date.now()}`,
      orderId: order.id,
      trackingNumber: tracking,
      status: "Label Created",
      service: "DHL Express",
      estimatedDelivery: "3–5 days",
      createdAt: new Date().toISOString(),
    };

    try {
      const existing: Shipment[] = JSON.parse(
        localStorage.getItem("autobridge_shipments") || "[]",
      );

      const updated = [...existing, newShipment];

      localStorage.setItem("autobridge_shipments", JSON.stringify(updated));

      // 🔥 SINGLE GLOBAL SYNC EVENT (standardized)
      window.dispatchEvent(
        new CustomEvent("autobridge_shipments_sync", {
          detail: updated,
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to create shipment");
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: "Packed" } : o)),
    );

    setSelectedOrder(null);

    toast.success(`Shipment created! Tracking: ${tracking}`);
  }
  function formatDate(dateString: string) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0B1120] text-white p-4 sm:p-6">
        {/* ================= HEADER ================= */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Vendor Orders</h1>

            <p className="text-white/50 mt-2">
              Manage customer purchases, fulfillment and order workflow
            </p>
          </div>

          <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-3 rounded-2xl flex items-center justify-center gap-2">
            <Download size={18} />
            Export Orders
          </button>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Orders"
            value={orders.length.toString()}
            icon={<ShoppingCart size={20} />}
          />

          <StatCard
            title="Pending"
            value={orders
              .filter((o) => o.status === "Pending")
              .length.toString()}
            icon={<Clock3 size={20} />}
          />

          <StatCard
            title="Processing"
            value={orders
              .filter((o) => o.status === "Processing")
              .length.toString()}
            icon={<Package size={20} />}
          />

          <StatCard
            title="Shipped"
            value={orders
              .filter((o) => o.status === "Shipped")
              .length.toString()}
            icon={<Truck size={20} />}
          />

          <StatCard
            title="Delivered"
            value={orders
              .filter((o) => o.status === "Delivered")
              .length.toString()}
            icon={<CheckCircle2 size={20} />}
          />
        </div>

        {/* ================= CONTROLS ================= */}

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6">
          {/* SEARCH */}

          <div className="relative w-full lg:w-[380px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders or customer..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "Pending",
              "Processing",
              "Packed",
              "Shipped",
              "Delivered",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-xl border text-sm transition ${
                  filter === status
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ================= ORDERS ================= */}

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-5"
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                {/* LEFT */}

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                      <ShoppingCart size={24} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold">{order.id}</h3>

                      <p className="text-white/40 text-sm mt-1">
                        {order.customer}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                    <InfoItem
                      label="Items"
                      value={`${order.items} product(s)`}
                    />

                    <InfoItem
                      label="Date"
                      value={formatDate(order.createdAt)}
                    />

                    <InfoItem
                      label="Payment"
                      value={order.payment}
                      valueClass={paymentStyle(order.payment)}
                    />

                    <InfoItem
                      label="Total"
                      value={`₦${order.total.toLocaleString()}`}
                    />
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* STATUS */}

                  <div
                    className={`px-4 py-2 rounded-full text-sm border ${getStatusStyle(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                    >
                      <Eye size={18} />
                    </button>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value as OrderStatus,
                        )
                      }
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="Pending">Pending</option>

                      <option value="Processing">Processing</option>

                      <option value="Packed">Packed</option>

                      <option value="Shipped">Shipped</option>

                      <option value="Delivered">Delivered</option>

                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= EMPTY ================= */}

        {filteredOrders.length === 0 && (
          <div className="text-center py-24 text-white/40">No orders found</div>
        )}

        {/* ================= ORDER DETAILS MODAL ================= */}

        {selectedOrder && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-[#111827] border border-white/10 rounded-3xl overflow-hidden">
              {/* HEADER */}

              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedOrder.id}</h2>

                  <p className="text-white/40 mt-1">
                    Order details and customer information
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}

              <div className="p-6 space-y-8">
                {/* CUSTOMER */}

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Customer Information
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <ModalCard
                      title="Customer"
                      value={selectedOrder.customer}
                    />

                    <ModalCard title="Email" value={selectedOrder.email} />

                    <ModalCard title="Phone" value={selectedOrder.phone} />

                    <ModalCard
                      title="Shipping Address"
                      value={selectedOrder.shippingAddress}
                    />
                  </div>
                </div>

                {/* ORDER */}

                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <ModalCard
                      title="Items"
                      value={`${selectedOrder.items} items`}
                    />

                    <ModalCard title="Payment" value={selectedOrder.payment} />

                    <ModalCard
                      title="Total"
                      value={`₦${selectedOrder.total.toLocaleString()}`}
                    />
                  </div>
                </div>

                {/* DHL / SHIPPING */}

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="text-orange-400" />

                    <h3 className="font-semibold">DHL Fulfillment Ready</h3>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed">
                    This order is structured for future DHL integration
                    including live shipping rates, tracking, airway bill
                    generation, delivery zones and fulfillment workflow.
                  </p>

                  <button
                    onClick={() => createShipment(selectedOrder)}
                    className="mt-5 bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-xl flex items-center gap-2"
                  >
                    Create Shipment
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ================= REUSABLES ================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-white/40 text-sm">{title}</div>

        <div className="text-orange-400">{icon}</div>
      </div>

      <div className="text-3xl font-bold mt-4">{value}</div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1">{label}</p>

      <p className={`font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

function ModalCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-white/40 text-xs mb-2">{title}</p>

      <p className="font-medium">{value}</p>
    </div>
  );
}

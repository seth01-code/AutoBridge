"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Store,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Truck,
  Activity,
  ShieldAlert,
} from "lucide-react";

import { AdminService } from "../../lib/admin/adminService";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [u, v, o] = await Promise.all([
        AdminService.getUsers(),
        AdminService.getVendors(),
        AdminService.getOrders(),
      ]);

      setUsers(u);
      setVendors(v);
      setOrders(o);

      setLoading(false);
    }

    load();
  }, []);

  /* ================= METRICS ================= */

  const pendingVendors = vendors.filter((v) => v.status === "pending").length;
  const pendingOrders = orders.filter((o) => o.status === "processing").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const revenue = orders.reduce(
    (sum, o) => sum + (o.amount || 0),
    0
  );

  const activeUsers = users.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Admin Control Center</h1>
        <p className="text-white/50 text-sm">
          Real-time platform intelligence & operations overview
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Users />}
          label="Active Users"
          value={activeUsers}
          trend="+12%"
          color="text-blue-400"
        />

        <KpiCard
          icon={<Store />}
          label="Pending Vendors"
          value={pendingVendors}
          trend="+4"
          color="text-orange-400"
        />

        <KpiCard
          icon={<Package />}
          label="Processing Orders"
          value={pendingOrders}
          trend="-2%"
          color="text-yellow-400"
        />

        <KpiCard
          icon={<DollarSign />}
          label="Revenue"
          value={`₦${revenue.toLocaleString()}`}
          trend="+18%"
          color="text-green-400"
        />
      </div>

      {/* SYSTEM INSIGHTS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ACTIVITY FEED */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-orange-400" size={18} />
            <h2 className="font-semibold">Live Activity</h2>
          </div>

          <div className="space-y-4 text-sm">
            <ActivityItem
              text="New vendor application submitted"
              time="2 min ago"
              type="warning"
            />
            <ActivityItem
              text="Order #AB-20394 shipped successfully"
              time="10 min ago"
              type="success"
            />
            <ActivityItem
              text="Payment of ₦120,000 processed"
              time="25 min ago"
              type="success"
            />
            <ActivityItem
              text="System latency spike detected"
              time="1 hr ago"
              type="danger"
            />
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-blue-400" size={18} />
            <h2 className="font-semibold">System Health</h2>
          </div>

          <div className="space-y-4 text-sm">
            <HealthBar label="API Uptime" value={99.98} />
            <HealthBar label="Database Load" value={72} />
            <HealthBar label="Server CPU" value={54} />
            <HealthBar label="Storage Usage" value={61} />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-purple-400" size={18} />
            <h2 className="font-semibold">Quick Actions</h2>
          </div>

          <div className="space-y-3">
            <ActionButton label="Approve Vendors" count={pendingVendors} />
            <ActionButton label="Review Orders" count={pendingOrders} />
            <ActionButton label="Export Reports" />
            <ActionButton label="System Logs" />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* RECENT ORDERS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Truck className="text-orange-400" size={18} />
            Recent Orders
          </h2>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm border-b border-white/5 pb-2"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-white/40 text-xs">
                    {order.customer || "Customer"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-green-400">
                    ₦{order.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RISK / ALERTS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={18} />
            Risk & Alerts
          </h2>

          <div className="space-y-3 text-sm">
            <AlertItem
              text="3 vendors pending verification > 48hrs"
              severity="high"
            />
            <AlertItem
              text="Payment gateway latency increased"
              severity="medium"
            />
            <AlertItem
              text="2 failed shipments detected"
              severity="high"
            />
            <AlertItem
              text="Low stock alert on 12 products"
              severity="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function KpiCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          {icon}
        </div>
        <span className="text-xs text-green-400">{trend}</span>
      </div>

      <p className="text-white/50 text-sm mt-3">{label}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}

function ActivityItem({ text, time, type }: any) {
  const color =
    type === "success"
      ? "text-green-400"
      : type === "warning"
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="flex justify-between">
      <p className={color}>{text}</p>
      <span className="text-white/30 text-xs">{time}</span>
    </div>
  );
}

function HealthBar({ label, value }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/50 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({ label, count }: any) {
  return (
    <button className="w-full flex justify-between items-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm">
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-orange-400">{count}</span>
      )}
    </button>
  );
}

function AlertItem({ text, severity }: any) {
  const color =
    severity === "high"
      ? "text-red-400"
      : severity === "medium"
      ? "text-yellow-400"
      : "text-blue-400";

  return <p className={color}>• {text}</p>;
}
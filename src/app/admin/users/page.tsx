"use client";

import { useMemo, useState } from "react";
import { users as mockUsers } from "../../../lib/admin/admin.mock";
import {
  Search,
  Ban,
  CheckCircle2,
  MoreVertical,
  User,
  AlertTriangle,
  Wallet,
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  Eye,
} from "lucide-react";

type Role = "admin" | "vendor" | "user";
type Status = "active" | "banned" | "pending" | "suspended";

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchRole = filterRole === "all" ? true : u.role === filterRole;
      const matchStatus =
        filterStatus === "all" ? true : u.status === filterStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  /* ================= ACTIONS ================= */
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const banSelected = () => {
    setUsers((prev) =>
      prev.map((u) =>
        selected.includes(u.id) ? { ...u, status: "banned" } : u
      )
    );
    setSelected([]);
  };

  const verifyUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "active" } : u))
    );
  };

  const suspendUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "suspended" } : u))
    );
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Intelligence Center</h1>
          <p className="text-white/50 text-sm">
            Full control over customers, vendors, risk, and activity
          </p>
        </div>

        {selected.length > 0 && (
          <button
            onClick={banSelected}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl flex items-center gap-2"
          >
            <Ban size={16} />
            Ban Selected ({selected.length})
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Total Users" value={users.length} icon={<User />} />
        <Stat label="Active" value={users.filter(u => u.status === "active").length} />
        <Stat label="Vendors" value={users.filter(u => u.role === "vendor").length} />
        <Stat label="High Risk" value={users.filter(u => u.risk === "high").length} />
        <Stat label="Wallets" value="₦12.4M" />
      </div>

      {/* FILTER */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, email, wallet ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-orange-500"
          />
        </div>

        <select
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="vendor">Vendor</option>
          <option value="user">User</option>
        </select>

        <select
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* USER CARDS (PRO LEVEL UI) */}
      <div className="space-y-3">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row justify-between gap-4 hover:bg-white/10 transition"
          >
            {/* LEFT */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.includes(u.id)}
                onChange={() => toggleSelect(u.id)}
              />

              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center font-bold">
                {u.name.charAt(0)}
              </div>

              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-white/50">{u.email}</p>

                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-1 bg-white/10 rounded">
                    {u.role}
                  </span>

                  <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
                    Wallet: ₦{u.wallet}
                  </span>

                  <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded flex items-center gap-1">
                    <ShoppingBag size={12} />
                    {u.orders} orders
                  </span>

                  {u.risk === "high" && (
                    <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded flex items-center gap-1">
                      <AlertTriangle size={12} />
                      High Risk
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col lg:items-end gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded border ${
                    u.status === "active"
                      ? "text-green-400 border-green-500/30 bg-green-500/10"
                      : u.status === "banned"
                      ? "text-red-400 border-red-500/30 bg-red-500/10"
                      : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                  }`}
                >
                  {u.status}
                </span>

                <span className="text-xs text-white/40 flex items-center gap-1">
                  <Clock size={12} />
                  {u.lastLogin}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => verifyUser(u.id)}
                  className="text-green-400 hover:bg-green-500/10 p-2 rounded-lg"
                >
                  <CheckCircle2 size={16} />
                </button>

                <button
                  onClick={() => suspendUser(u.id)}
                  className="text-yellow-400 hover:bg-yellow-500/10 p-2 rounded-lg"
                >
                  <Ban size={16} />
                </button>

                <button className="text-white/50 hover:bg-white/10 p-2 rounded-lg">
                  <Eye size={16} />
                </button>

                <button className="text-white/50 hover:bg-white/10 p-2 rounded-lg">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function Stat({ label, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">{label}</p>
        <div className="text-orange-400">{icon}</div>
      </div>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
    </div>
  );
}
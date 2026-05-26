"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminService } from "../../../lib/admin/adminService";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Store,
  Filter,
} from "lucide-react";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await AdminService.getVendors();
      setVendors(data);
      setLoading(false);
    }
    load();
  }, []);

  /* ================= ACTIONS ================= */

  const approve = async (id: string) => {
    await AdminService.approveVendor(id);

    setVendors((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "approved" } : v
      )
    );
  };

  const reject = async (id: string) => {
    await AdminService.rejectVendor(id);

    setVendors((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "rejected" } : v
      )
    );
  };

  const suspend = (id: string) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "suspended" } : v
      )
    );
  };

  /* ================= FILTERED ================= */

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ? true : v.status === filter;

      return matchSearch && matchFilter;
    });
  }, [vendors, search, filter]);

  /* ================= STATS ================= */

  const pending = vendors.filter((v) => v.status === "pending").length;
  const approved = vendors.filter((v) => v.status === "approved").length;
  const rejected = vendors.filter((v) => v.status === "rejected").length;
  const suspended = vendors.filter((v) => v.status === "suspended").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Vendor Applications</h1>
        <p className="text-white/50 text-sm">
          Review, approve, or reject onboarding requests
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Pending" value={pending} icon={<Clock />} />
        <Stat label="Approved" value={approved} icon={<CheckCircle2 />} />
        <Stat label="Rejected" value={rejected} icon={<XCircle />} />
        <Stat label="Suspended" value={suspended} icon={<ShieldAlert />} />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              {/* LEFT */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Store className="text-orange-400" />
                </div>

                <div>
                  <h2 className="font-semibold">{v.name}</h2>
                  <p className="text-sm text-white/50">{v.email}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded bg-white/10">
                      ID: {v.id}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        v.status === "approved"
                          ? "text-green-400 border-green-500/30 bg-green-500/10"
                          : v.status === "pending"
                          ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                          : v.status === "rejected"
                          ? "text-red-400 border-red-500/30 bg-red-500/10"
                          : "text-gray-400 border-gray-500/30 bg-gray-500/10"
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex flex-wrap gap-2">
                {v.status === "pending" && (
                  <>
                    <button
                      onClick={() => approve(v.id)}
                      className="px-4 py-2 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(v.id)}
                      className="px-4 py-2 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl"
                    >
                      Reject
                    </button>
                  </>
                )}

                {v.status === "approved" && (
                  <button
                    onClick={() => suspend(v.id)}
                    className="px-4 py-2 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl"
                  >
                    Suspend
                  </button>
                )}
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
        <div className="text-orange-400">{icon}</div>
      </div>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
    </div>
  );
}
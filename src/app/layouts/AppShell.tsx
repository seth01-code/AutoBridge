"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  BarChart3,
  Settings,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Users,
  Bell,
  ClipboardList,
} from "lucide-react";
import { logout } from "../../lib/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  /* CLOSE PROFILE */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* ================= NAVIGATION (AUTO BRIDGE VENDOR OS) ================= */

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Products",
      icon: ShoppingBag,
      path: "/vendor/product",
    },
    {
      label: "Orders",
      icon: Package,
      path: "/orders",
    },
    {
      label: "Shipments",
      icon: Truck,
      path: "/vendor/shipments",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/vendor/analytics",
    },
    {
      label: "Customers",
      icon: Users,
      path: "/vendor/customers",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/vendor/settings",
    },
  ];

  return (
    <>
      <div className="flex h-screen bg-[#0B1120] text-white overflow-hidden">
        {/* BACKDROP */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed lg:static z-50 h-full
            bg-[#0F172A]/95 backdrop-blur-xl
            border-r border-white/10
            transition-all duration-300
            w-[260px]
            ${collapsed ? "lg:w-[80px]" : "lg:w-[260px]"}
            ${
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          {/* BRAND */}
          <div className="flex items-center justify-between p-4">
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">
                  <Link href="/">
                    AutoBridge{" "}
                    <span className="text-orange-500">Commerce</span>
                  </Link>
                </h1>
                <p className="text-xs text-white/50">
                  Vendor Operating System
                </p>
              </div>
            )}

            <button
              onClick={() => setCollapsed((p) => !p)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-white/10"
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
          </div>

          {/* NAV */}
          <nav className="space-y-2 px-3 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.path ||
                pathname.startsWith(item.path + "/");

              return (
                <div
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition
                    ${
                      active
                        ? "bg-orange-500/20 text-white border border-orange-500/30"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }
                    ${collapsed ? "lg:justify-center" : ""}
                  `}
                >
                  <Icon size={18} className="text-orange-400" />
                  {!collapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <div className="flex flex-col flex-1 w-full">
          {/* TOPBAR */}
          <header className="h-[64px] border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
            {/* LEFT */}
            <div className="flex items-center gap-3 w-full max-w-[500px]">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              >
                <Menu size={20} />
              </button>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                Demo
              </div>

              {/* PROFILE */}
              <div className="relative z-[100]" ref={profileRef}>
                <button
                  onClick={() => setOpenProfile((p) => !p)}
                  className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30"
                />

                {openProfile && (
                  <div className="absolute right-0 mt-3 w-48 bg-[#111827] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[999]">
                    <DropdownItem icon={<User size={16} />} label="Profile" />
                    <DropdownItem
                      icon={<Bell size={16} />}
                      label="Notifications"
                    />
                    <DropdownItem
                      icon={<Settings size={16} />}
                      label="Settings"
                    />
                    <DropdownItem
                      icon={<ClipboardList size={16} />}
                      label="Activity Log"
                    />
                    <DropdownItem
  icon={<LogOut size={16} />}
  label="Logout"
  onClick={logout}
/>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            {children}
          </main>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

/* DROPDOWN */
function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-white/80"
    >
      <div className="text-orange-400">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
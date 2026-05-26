// app/admin/layout.tsx
"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Truck,
  CreditCard,
  Settings,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
} from "lucide-react";

import { logout } from "../../lib/auth";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  /* CLOSE PROFILE ON OUTSIDE CLICK */
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

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/vendors", label: "Vendors", icon: Store },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/logistics", label: "Logistics", icon: Truck },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
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
            <h1 className="text-lg font-bold">
              Auto<span className="text-orange-500">Bridge</span> Admin
            </h1>
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
          {nav.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition
                  ${
                    active
                      ? "bg-orange-500/20 border border-orange-500/30 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }
                  ${collapsed ? "lg:justify-center" : ""}
                `}
              >
                <Icon size={18} className="text-orange-400" />
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 w-full">
        {/* TOPBAR */}
        <header className="h-[64px] border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            >
              <Menu size={20} />
            </button>

            <p className="text-white/50 text-sm hidden sm:block">
              Admin Control Center
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenProfile((p) => !p)}
                className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30"
              />

              {openProfile && (
                <div className="absolute right-0 mt-3 w-48 bg-[#111827] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[999]">
                  <DropdownItem icon={<User size={16} />} label="Profile" />

                  <DropdownItem
                    icon={<LogOut size={16} />}
                    label="Logout"
                    onClick={handleLogout}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/* DROPDOWN ITEM */
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
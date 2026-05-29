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
  ChevronRight,
  Shield,
} from "lucide-react";
import { logout } from "../../lib/auth";
import ThemeToggle from "../components/layout/Themetoggle";

type Props = { children: ReactNode };

const nav = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard, group: "core" },
  { href: "/admin/users",      label: "Users",       icon: Users,           group: "core" },
  { href: "/admin/vendors",    label: "Vendors",     icon: Store,           group: "core" },
  { href: "/admin/orders",     label: "Orders",      icon: Package,         group: "operations" },
  { href: "/admin/logistics",  label: "Logistics",   icon: Truck,           group: "operations" },
  { href: "/admin/payments",   label: "Payments",    icon: CreditCard,      group: "operations" },
  { href: "/admin/settings",   label: "Settings",    icon: Settings,        group: "system" },
];

export default function AdminLayout({ children }: Props) {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname   = usePathname();
  const router     = useRouter();

  /* close profile on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setOpenProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => { logout(); router.push("/"); };

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));

  /* breadcrumb label */
  const currentPage = nav.find((n) => isActive(n.href))?.label ?? "Dashboard";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--ab-bg)", color: "var(--ab-text-primary)" }}
    >
      {/* ── MOBILE BACKDROP ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        />
      )}

      {/* ═══════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════ */}
      <aside
        style={{
          width: collapsed ? "var(--ab-sidebar-collapsed)" : "var(--ab-sidebar-width)",
          background: "var(--ab-surface)",
          borderRight: "1px solid var(--ab-border)",
          boxShadow: "var(--ab-shadow-sm)",
          flexShrink: 0,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          position: "fixed",
          left: 0,
          top: 0,
          height: "100%",
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
        className={`lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* BRAND */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: "var(--ab-topbar-h)",
            borderBottom: "1px solid var(--ab-border)",
          }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                style={{ background: "var(--ab-accent-light)", border: "1px solid var(--ab-accent-border)" }}
              >
                <Shield size={14} style={{ color: "var(--ab-accent)" }} />
              </div>
              <div className="overflow-hidden">
                <p
                  className="text-sm font-bold leading-none truncate"
                  style={{ fontFamily: "'Sora', sans-serif", color: "var(--ab-text-primary)" }}
                >
                  AutoBridge <span style={{ color: "var(--ab-accent)" }}>Admin</span>
                </p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--ab-text-muted)" }}>
                  Control Centre
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed((p) => !p)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl transition-colors duration-150 flex-shrink-0"
            style={{ color: "var(--ab-text-muted)", background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ab-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* NAV GROUPS */}
        <nav className="px-3 py-4 space-y-6 overflow-y-auto" style={{ height: "calc(100% - var(--ab-topbar-h))" }}>
          {[
            { group: "core",       label: "Main" },
            { group: "operations", label: "Operations" },
            { group: "system",     label: "System" },
          ].map(({ group, label }) => (
            <div key={group}>
              {!collapsed && (
                <p
                  className="text-[10px] font-600 uppercase tracking-widest px-3 mb-2"
                  style={{ color: "var(--ab-text-muted)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em" }}
                >
                  {label}
                </p>
              )}
              <div className="space-y-0.5">
                {nav.filter((n) => n.group === group).map((item) => {
                  const Icon   = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${collapsed ? "justify-center" : ""}`}
                      style={{
                        background:  active ? "var(--ab-accent-light)"  : "transparent",
                        border:      active ? "1px solid var(--ab-accent-border)" : "1px solid transparent",
                        color:       active ? "var(--ab-accent)"         : "var(--ab-text-secondary)",
                        fontFamily:  "'DM Sans', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "var(--ab-surface-2)";
                          e.currentTarget.style.color = "var(--ab-text-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--ab-text-secondary)";
                        }
                      }}
                    >
                      <Icon size={17} style={{ flexShrink: 0, color: active ? "var(--ab-accent)" : "inherit" }} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && active && (
                        <ChevronRight size={14} className="ml-auto opacity-60" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ═══════════════════════════════════════
          MAIN AREA
      ═══════════════════════════════════════ */}
      <div
        className="flex flex-col flex-1 min-w-0"
        style={{
          marginLeft: collapsed ? "var(--ab-sidebar-collapsed)" : "var(--ab-sidebar-width)",
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* TOPBAR */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
          style={{
            height: "var(--ab-topbar-h)",
            background: "var(--ab-surface)",
            borderBottom: "1px solid var(--ab-border)",
            boxShadow: "var(--ab-shadow-sm)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}
            >
              <Menu size={18} />
            </button>

            {/* BREADCRUMB */}
            <div className="hidden sm:flex items-center gap-2" style={{ color: "var(--ab-text-muted)", fontSize: "0.82rem" }}>
              <span>Admin</span>
              <ChevronRight size={13} />
              <span style={{ color: "var(--ab-text-primary)", fontWeight: 500 }}>{currentPage}</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* LIVE BADGE */}
            <span
              className="hidden sm:inline-flex items-center gap-1.5 ab-badge ab-badge-green text-xs"
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--ab-green)" }}
              />
              Live
            </span>

            {/* THEME TOGGLE */}
            <ThemeToggle />

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenProfile((p) => !p)}
                className="flex items-center justify-center w-9 h-9 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "var(--ab-accent-light)",
                  border: "1px solid var(--ab-accent-border)",
                  color: "var(--ab-accent)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                A
              </button>

              {openProfile && (
                <div
                  className="absolute right-0 mt-2 w-52 overflow-hidden z-[999]"
                  style={{
                    background: "var(--ab-surface)",
                    border: "1px solid var(--ab-border-strong)",
                    borderRadius: "14px",
                    boxShadow: "var(--ab-shadow-lg)",
                  }}
                >
                  {/* Profile header */}
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid var(--ab-border)", background: "var(--ab-surface-2)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "var(--ab-text-primary)", fontFamily: "'Sora', sans-serif" }}>
                      Admin User
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ab-text-muted)" }}>
                      admin@autobridge.africa
                    </p>
                  </div>
                  <DropdownItem icon={<User size={15} />}   label="Profile" />
                  <DropdownItem icon={<LogOut size={15} />} label="Logout"  onClick={handleLogout} danger />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6"
          style={{ background: "var(--ab-bg)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── DROPDOWN ITEM ── */
function DropdownItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors duration-100"
      style={{ color: danger ? "var(--ab-accent)" : "var(--ab-text-secondary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ab-surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: danger ? "var(--ab-accent)" : "var(--ab-text-muted)" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
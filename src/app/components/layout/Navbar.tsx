"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  Truck,
  Store,
  Shirt,
  Sprout,
  Wrench,
  ChevronDown,
  Globe,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "../../context/Cartcontext";
import CartDrawer from "../Cart/cartDrawer";
import ThemeToggle from "./Themetoggle";

const categories = [
  {
    title: "Agro Products",
    icon: Sprout,
    color: "#1A7A4A",
    items: ["Cocoa", "Cashew", "Ginger", "Sesame", "Coffee", "Palm Products", "Grains & Spices"],
  },
  {
    title: "Packaged Foods",
    icon: Package,
    color: "#E8520A",
    items: ["Packaged Garri", "Plantain Chips", "Palm Oil", "Ground Spices", "Dried Foods", "African Snacks", "Ready-to-export"],
  },
  {
    title: "African Fashion",
    icon: Shirt,
    color: "#7B3FE4",
    items: ["Ankara Prints", "Adire", "African Textiles", "Ready-to-Wear", "Fashion Accessories", "Handmade Products"],
  },
  {
    title: "Auto Parts",
    icon: Wrench,
    color: "#1A5FA0",
    items: ["Engine Components", "Brake Systems", "Vehicle Electronics", "Suspension Parts", "Tires & Accessories", "OEM & Aftermarket"],
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCategories, setMobileCategories] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const { cartCount, openDrawer } = useCart();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node))
        setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <CartDrawer />

      {/* ── ANNOUNCEMENT STRIP ── */}
      <div
        className="hidden md:flex items-center justify-center gap-6 text-xs py-2 px-6"
        style={{ background: "var(--primary)", color: "#fff" }}
      >
        <Globe size={13} />
        <span>AutoBridge Commerce — Shipping to 75+ countries worldwide with DHL-powered fulfillment</span>
        <Link href="/marketplace" className="underline underline-offset-2 font-medium hover:no-underline" style={{ color: "#fff" }}>
          Explore Marketplace →
        </Link>
      </div>

      <header
        className="sticky top-0 z-40"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="mx-auto flex h-[66px] max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 no-underline">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-base"
              style={{
                background: "var(--primary-light)",
                border: "1px solid var(--primary-border)",
                color: "var(--primary)",
              }}
            >
              <Store />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold leading-none" style={{ color: "var(--text-primary)" }}>
                AutoBridge <span style={{ color: "var(--primary)" }}>Commerce</span>
              </h1>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                Marketplace & Logistics Network
              </p>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/marketplace",     label: "Marketplace", icon: Store   },
              { href: "/tracker",         label: "Track Order", icon: Truck   },
              { href: "/customer-orders", label: "My Orders",   icon: Package },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 no-underline"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}

            {/* CATEGORIES DROPDOWN */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatOpen((p) => !p)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  color:      catOpen ? "var(--primary)"        : "var(--text-secondary)",
                  background: catOpen ? "var(--primary-light)"  : "transparent",
                  border:     catOpen ? "1px solid var(--primary-border)" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                <LayoutDashboard size={15} />
                Categories
                <ChevronDown
                  size={14}
                  style={{ transition: "transform 0.2s", transform: catOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              {catOpen && (
                <div
                  className="absolute left-0 top-[calc(100%+8px)] grid grid-cols-2 gap-px w-[580px]"
                  style={{
                    background: "var(--border)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={cat.title} className="p-4" style={{ background: "var(--surface)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="flex items-center justify-center w-7 h-7 rounded-lg"
                            style={{ background: cat.color + "18", border: `1px solid ${cat.color}30` }}
                          >
                            <CatIcon size={14} style={{ color: cat.color }} />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {cat.title}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {cat.items.map((item) => (
                            <li key={item}>
                              <Link
                                href="/marketplace"
                                className="block text-xs py-0.5 no-underline transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                                onClick={() => setCatOpen(false)}
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* ── ACTIONS ── */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:flex" />

            {/* CART */}
            <button
              onClick={() => openDrawer("cart")}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
              aria-label="Open cart"
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* ACCOUNT */}
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold no-underline transition-all"
              style={{
                background: "var(--primary)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(232,82,10,0.28)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary-hover)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--primary)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <User size={15} />
              Account
            </Link>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border-strong)",
                background: "var(--surface-2)",
                cursor: "pointer",
              }}
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4"
            style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
          >
            <div className="pt-3 space-y-1">
              {[
                { href: "/marketplace",     label: "Marketplace", icon: Store   },
                { href: "/tracker",         label: "Track Order", icon: Truck   },
                { href: "/customer-orders", label: "My Orders",   icon: Package },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm no-underline"
                  style={{ color: "var(--text-secondary)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={16} style={{ color: "var(--primary)" }} />
                  {label}
                </Link>
              ))}

              {/* MOBILE CATEGORIES ACCORDION */}
              <div>
                <button
                  onClick={() => setMobileCategories(!mobileCategories)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    color: "var(--text-secondary)",
                    background: "transparent",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  <span className="flex items-center gap-3">
                    <LayoutDashboard size={16} style={{ color: "var(--primary)" }} />
                    Categories
                  </span>
                  <ChevronDown
                    size={15}
                    style={{
                      transition: "transform 0.2s",
                      transform: mobileCategories ? "rotate(180deg)" : "rotate(0deg)",
                      color: "var(--text-muted)",
                    }}
                  />
                </button>

                {mobileCategories && (
                  <div
                    className="mt-2 ml-4 space-y-4 pl-4"
                    style={{ borderLeft: "2px solid var(--primary-border)" }}
                  >
                    {categories.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <div key={cat.title}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <CatIcon size={13} style={{ color: cat.color }} />
                            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                              {cat.title}
                            </span>
                          </div>
                          <div className="space-y-1 ml-5">
                            {cat.items.map((item) => (
                              <Link
                                key={item}
                                href="/marketplace"
                                className="block text-xs no-underline"
                                style={{ color: "var(--text-muted)" }}
                                onClick={() => setMenuOpen(false)}
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "8px" }}>
                <button
                  onClick={() => { setMenuOpen(false); openDrawer("cart"); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <ShoppingCart size={16} style={{ color: "var(--primary)" }} />
                  Cart {cartCount > 0 && `(${cartCount})`}
                </button>

                <Link
                  href="/account"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm no-underline"
                  style={{ color: "var(--text-secondary)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={16} style={{ color: "var(--primary)" }} />
                  Account
                </Link>

                <div className="flex items-center gap-3 px-3 py-2.5">
                  <ThemeToggle />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Toggle theme</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
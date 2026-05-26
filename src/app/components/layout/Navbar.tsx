"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  Truck,
  Store,
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Gamepad2,
  Sparkles,
  Car,
  Baby,
  Dumbbell,
} from "lucide-react";
import { getCartCount } from "../../../lib/cart";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileCategories, setMobileCategories] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCartCount());

    const update = () => setCount(getCartCount());

    // listen for cart updates from other tabs/pages
    window.addEventListener("storage", update);

    // custom trigger for same tab updates
    window.addEventListener("cartUpdated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cartUpdated", update);
    };
  }, []);

  const categories = [
    {
      title: "Electronics",
      icon: <Smartphone size={16} />,
      items: ["Phones", "Laptops", "Tablets", "Accessories"],
    },
    {
      title: "Fashion",
      icon: <Shirt size={16} />,
      items: ["Men", "Women", "Shoes", "Watches"],
    },
    {
      title: "Home & Living",
      icon: <Home size={16} />,
      items: ["Furniture", "Kitchen", "Decor", "Lighting"],
    },
    {
      title: "Gaming",
      icon: <Gamepad2 size={16} />,
      items: ["Consoles", "Games", "Controllers", "PC Gaming"],
    },
    {
      title: "Automotive",
      icon: <Car size={16} />,
      items: ["Car Parts", "Accessories", "Tools"],
    },
    {
      title: "Baby & Kids",
      icon: <Baby size={16} />,
      items: ["Toys", "Clothing", "Essentials"],
    },
    {
      title: "Fitness",
      icon: <Dumbbell size={16} />,
      items: ["Gym Equipment", "Supplements", "Wearables"],
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/30">
            <span className="font-bold text-orange-400">A</span>
          </div>

          <div className="hidden sm:block">
            <h1 className="text-xl font-bold">AutoBridge</h1>
            <p className="text-xs text-white/40">
              Marketplace & Logistics Network
            </p>
          </div>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <Link href="/marketplace" className="hover:text-white transition">
            Marketplace
          </Link>

          {/* ================= CATEGORIES DROPDOWN ================= */}
          <div className="relative group cursor-pointer">
            <span className="hover:text-white transition">Categories</span>

            {/* MEGA DROPDOWN */}
            <div className="absolute left-0 top-8 hidden group-hover:grid grid-cols-3 gap-6 bg-[#0F172A] border border-white/10 p-6 rounded-2xl w-[600px] shadow-xl">
              {categories.map((cat) => (
                <div key={cat.title}>
                  <div className="flex items-center gap-2 text-orange-400 font-medium mb-2">
                    {cat.icon}
                    {cat.title}
                  </div>

                  <ul className="space-y-1 text-white/60 text-sm">
                    {cat.items.map((item) => (
                      <li key={item}>
                        <Link
                          href="/marketplace"
                          className="hover:text-white transition"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <Link href="/tracker" className="hover:text-white transition">
            Track Order
          </Link>

          <Link href="/customer-orders" className="hover:text-white transition">
            Orders
          </Link>
        </nav>

        {/* SEARCH */}
        {/* <div className="hidden lg:flex w-[320px] items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <Search size={18} className="text-white/40" />
          <input
            type="text"
            placeholder="Search products, brands..."
            className="w-full bg-transparent px-3 outline-none text-sm"
          />
        </div> */}

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* CART */}
          <Link href="/cart">
            <button className="relative rounded-xl border border-white/10 p-3 hover:bg-white/5 transition">
              <ShoppingCart size={18} />

              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-orange-500 text-white rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </Link>

          {/* ACCOUNT */}
          <Link
            href="/account"
            className="hidden sm:flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium hover:bg-orange-600 transition"
          >
            <User size={16} />
            Account
          </Link>

          {/* MOBILE MENU */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-xl border border-white/10 p-3"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0B1120] px-6 py-4 space-y-4">
          <Link href="/marketplace" className="flex items-center gap-2">
            <Store size={16} /> Marketplace
          </Link>

          {/* MOBILE CATEGORIES */}
          <div>
            <button
              onClick={() => setMobileCategories(!mobileCategories)}
              className="flex items-center justify-between w-full"
            >
              <span className="flex items-center gap-2">
                <Package size={16} /> Categories
              </span>
              <span>{mobileCategories ? "−" : "+"}</span>
            </button>

            {mobileCategories && (
              <div className="mt-3 space-y-4 pl-4 border-l border-white/10">
                {categories.map((cat) => (
                  <div key={cat.title}>
                    <div className="flex items-center gap-2 text-orange-400 text-sm">
                      {cat.icon}
                      {cat.title}
                    </div>

                    <div className="ml-6 mt-1 space-y-1 text-sm text-white/60">
                      {cat.items.map((item) => (
                        <Link
                          key={item}
                          href={`/category/${item.toLowerCase()}`}
                          className="block hover:text-white"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/tracker" className="flex items-center gap-2">
            <Truck size={16} /> Track Order
          </Link>

          <Link href="/customer-orders" className="flex items-center gap-2">
            <Store size={16} /> Orders
          </Link>

          <Link href="/account" className="flex items-center gap-2">
            <User size={16} /> Account
          </Link>
        </div>
      )}
    </header>
  );
}

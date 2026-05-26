"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Tag,
} from "lucide-react";
import Navbar from '../components/layout/Navbar'

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  vendor: string;
};

const initialCart: CartItem[] = [
  {
    id: "1",
    name: "Wireless Noise Cancelling Headphones",
    price: 249,
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    vendor: "TechNova Store",
  },
  {
    id: "2",
    name: "Premium Leather Backpack",
    price: 119,
    qty: 2,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    vendor: "Urban Carry",
  },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ================= CALCULATIONS ================= */

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cart]);

  const shipping = subtotal > 300 ? 0 : 15;

  const total = subtotal + shipping - discount;

  /* ================= CART ACTIONS ================= */

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const applyPromo = () => {
    if (promo.toLowerCase() === "autobridge10") {
      setDiscount(subtotal * 0.1);
    } else {
      setDiscount(0);
      alert("Invalid promo code");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-[#0B1120] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingBag className="text-orange-400" />
              Your Cart
            </h1>
            <p className="text-white/50 mt-2">
              Review your items before checkout
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {cart.length === 0 && (
          <div className="text-center py-24">
            <ShoppingBag size={50} className="mx-auto text-white/20" />
            <p className="text-white/40 mt-4">Your cart is empty</p>

            <Link
              href="/"
              className="inline-flex mt-6 px-6 py-3 bg-orange-500 rounded-xl"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {/* CART CONTENT */}
        {cart.length > 0 && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            {/* LEFT ITEMS */}
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 flex gap-5"
                >
                  {/* IMAGE */}
                  <div className="relative w-[120px] h-[100px] rounded-2xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-white/50 text-sm mt-1">
                      {item.vendor}
                    </p>

                    <p className="text-orange-400 font-semibold mt-2">
                      ${item.price}
                    </p>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-between mt-4">
                      {/* QTY */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* REMOVE */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT SUMMARY */}
            <div className="space-y-6">
              {/* SUMMARY */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `$${shipping}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>- ${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 transition py-3 rounded-xl font-medium"
                >
                  Checkout
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* PROMO */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Tag size={16} className="text-orange-400" />
                  Promo Code
                </h3>

                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none"
                  />

                  <button
                    onClick={applyPromo}
                    className="px-4 py-2 bg-white/10 rounded-xl"
                  >
                    Apply
                  </button>
                </div>

                <p className="text-xs text-white/40 mt-2">
                  Try: <span className="text-orange-400">AUTOBRIDGE10</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppShell from "../layouts/AppShell";

import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Truck,
  Trash2,
  Minus,
  Plus,
  MapPin,
  Globe,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

type CartItem = {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  eta: string;
};

const DEMO_CART: CartItem[] = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    image: "https://images.unsplash.com/photo-1580894908361-967195033215",
    price: 45000,
    quantity: 1,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    price: 120000,
    quantity: 2,
  },
];

/* 🔥 DHL-READY SHIPPING OPTIONS (MOCKED FOR NOW) */
const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "3–7 business days",
    price: 5000,
    eta: "3–7 days",
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "1–3 business days",
    price: 12000,
    eta: "1–3 days",
  },
  {
    id: "dhl",
    name: "DHL International Shipping",
    description: "Live DHL rates (mocked for now)",
    price: 0, // will come from DHL API later
    eta: "Calculated by DHL API",
  },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState<string>("standard");

  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "Nigeria",
    city: "",
    address: "",
    postalCode: "",
  });

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const stored = localStorage.getItem("cart");

    if (stored) {
      const parsed = JSON.parse(stored);

      const normalized = parsed.map((item: any) => ({
        ...item,
        quantity: item.quantity ?? item.qty ?? 1,
      }));

      setCart(normalized);
    } else {
      setCart(DEMO_CART);
    }
  }, []);

  /* ================= SAVE CART ================= */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /* ================= CALCULATIONS ================= */
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const selectedShipping = SHIPPING_METHODS.find(
    (s) => s.id === shippingMethod,
  );

  const shippingCost = selectedShipping?.price ?? 0;

  const total = subtotal + shippingCost;

  /* ================= CART ACTIONS ================= */
  function increase(id: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrease(id: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity > 1 ? item.quantity - 1 : 1,
            }
          : item,
      ),
    );
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function handleCheckout() {
    console.log("ORDER DATA:", {
      cart,
      address,
      shippingMethod,
      total,
    });

    alert("DHL-ready checkout structure prepared (API integration next)");
  }

  return (
    <>
    <Navbar/>
      <div className="min-h-screen bg-[#0B1120] text-white p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-orange-400 mb-4"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </Link>

            <h1 className="text-4xl font-bold">Checkout</h1>

            <p className="text-white/50 mt-2">DHL-powered logistics ready</p>
          </div>

          <div className="hidden md:flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-2xl">
            <Globe size={18} />
            Logistics Ready (DHL Integration)
          </div>
        </div>

        {/* EMPTY */}
        {cart.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
            <h2 className="text-2xl font-semibold mb-3">Cart is empty</h2>

            <button
              onClick={() => setCart(DEMO_CART)}
              className="bg-orange-500 px-6 py-3 rounded-xl"
            >
              Load Demo Cart
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* CART ITEMS */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-5 flex gap-5"
                >
                  <div className="w-32 h-32 relative rounded-xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.name}</h3>

                    <p className="text-orange-400 text-xl font-bold mt-2">
                      ₦{item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => decrease(item.id)}
                        className="p-2 bg-white/5 rounded-lg"
                      >
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => increase(item.id)}
                        className="p-2 bg-white/5 rounded-lg"
                      >
                        <Plus size={14} />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* SHIPPING METHODS */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Truck size={18} />
                  Shipping Method (DHL Ready)
                </h2>

                <div className="space-y-3">
                  {SHIPPING_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center justify-between p-4 border border-white/10 rounded-xl cursor-pointer"
                    >
                      <div>
                        <p className="font-semibold">{method.name}</p>

                        <p className="text-white/50 text-sm">
                          {method.description}
                        </p>
                      </div>

                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === method.id}
                        onChange={() => setShippingMethod(method.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* ADDRESS */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={18} />
                  Delivery Address
                </h2>

                <div className="grid gap-3">
                  <input
                    placeholder="Full Name"
                    className="input"
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        fullName: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="City"
                    className="input"
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        city: e.target.value,
                      })
                    }
                  />

                  <textarea
                    placeholder="Full Address"
                    className="input"
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₦{shippingCost.toLocaleString()}</span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-400">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-orange-500 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <CreditCard size={16} />
                Place Order
              </button>

              <div className="mt-5 text-sm text-white/50 space-y-2">
                <p>✔ DHL shipping integration ready</p>
                <p>✔ Real-time rates coming soon</p>
                <p>✔ Global logistics support</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

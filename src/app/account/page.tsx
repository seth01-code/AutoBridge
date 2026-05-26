"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Store,
  ShieldCheck,
  Truck,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { mockLogin } from "../../lib/mockAuth";
import { setUser } from "../../lib/auth";
import { toast } from "react-toastify";

type Mode = "login" | "signup";

export default function AccountPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      toast("Please enter email");
      return;
    }

    const user = mockLogin(cleanedEmail);

    if (!user) {
      toast("Invalid mock user email");
      return;
    }

    setUser(user);

    switch (user.role) {
      case "customer":
        router.push("/");
        break;

      case "vendor":
        router.push("/dashboard");
        break;

      case "admin":
        router.push("/admin");
        break;

      default:
        router.push("/");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0B1120] text-white">
      {/* ================= LEFT VISUAL (UPGRADED) ================= */}
      <div className="relative hidden lg:block overflow-hidden">
        {/* BACKGROUND IMAGE */}
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
          alt="commerce"
          fill
          className="object-cover opacity-30 scale-105"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0B1120]/80 to-[#0B1120]" />

        {/* ORANGE GLOW */}
        <div className="absolute top-20 left-20 w-[420px] h-[420px] bg-orange-500/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full" />

        {/* CONTENT */}
        <div className="relative z-10 h-full flex flex-col justify-center px-16">
          <h1 className="text-5xl font-bold leading-tight">
            Sell globally.
            <br />
            Ship instantly.
          </h1>

          <p className="text-white/60 mt-5 max-w-md text-sm leading-relaxed">
            Join a global commerce network where vendors, customers, and
            logistics operate seamlessly in one ecosystem.
          </p>

          {/* STATS STYLE CARDS */}
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                🚀
              </div>
              <div>
                <p className="text-sm font-medium">Fast Vendor Setup</p>
                <p className="text-xs text-white/50">
                  Start selling in minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                🌍
              </div>
              <div>
                <p className="text-sm font-medium">Global Reach</p>
                <p className="text-xs text-white/50">
                  Sell to customers worldwide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                📦
              </div>
              <div>
                <p className="text-sm font-medium">Smart Logistics</p>
                <p className="text-xs text-white/50">
                  Integrated shipping & tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT AUTH ================= */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* BRAND */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Auto<span className="text-orange-400">Bridge</span>
            </h1>
            <p className="text-white/50 text-sm mt-2">
              Marketplace & Logistics Infrastructure
            </p>
          </div>

          {/* MODE SWITCH */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm rounded-lg transition ${
                mode === "login" ? "bg-orange-500" : ""
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm rounded-lg transition ${
                mode === "signup" ? "bg-orange-500" : ""
              }`}
            >
              Create Account
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 outline-none"
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 outline-none"
              />
            </div>

            {mode === "signup" && (
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:border-orange-500 outline-none"
                />
              </div>
            )}

            {/* PRIMARY ACTION */}
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 transition py-3 rounded-xl font-medium"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight size={16} />
            </button>

            {/* DIVIDER */}
            {mode === "signup" && (
              <div className="text-center text-white/40 text-sm mt-6">
                Join as a customer or start selling below
              </div>
            )}
          </div>

          {/* ================= BECOME A VENDOR SECTION ================= */}
          {mode === "signup" && (
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-semibold flex items-center gap-2">
                  <Store className="text-orange-400" />
                  Become a Seller
                </h3>

                <p className="text-sm text-white/50 mt-2">
                  Start selling products globally, manage orders, and receive
                  fast payouts.
                </p>

                <Link
                  href="/vendor/onboarding"
                  className="mt-4 inline-flex items-center gap-2 text-orange-400 text-sm hover:underline"
                >
                  Start vendor application
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="text-orange-400" />
                  Just Shopping?
                </h3>

                <p className="text-sm text-white/50 mt-2">
                  Create a customer account and start buying instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import Navbar from "./components/layout/Navbar";
import AppShell from "./layouts/AppShell";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  BarChart3,
  Shield,
  Globe,
  Package,
  Users,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* HERO */}
      <section className="hero-grid relative overflow-hidden">
        <div className="mx-auto grid min-h-[90vh] max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-orange-400">
              Enterprise Commerce Infrastructure
            </div>

            <h1 className="max-w-2xl text-6xl font-bold leading-tight">
              Scale Your <span className="gradient-text">Multi-Vendor</span>{" "}
              Commerce Platform
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-text-secondary">
              The complete commerce, logistics, and fulfillment infrastructure
              for Nigeria and global markets. Built for scale..
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/account"
                className="rounded-2xl bg-primary px-8 py-4 font-semibold shadow-glow hover:scale-105 transition"
              >
                Start Selling
              </Link>

              <Link
                href="/marketplace"
                className="glass-card rounded-2xl px-8 py-4 hover:bg-white/10 transition"
              >
                Explore Marketplace
              </Link>
            </div>

            {/* QUICK STATS */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-sm text-text-secondary">
              <div>
                <div className="text-white text-2xl font-bold">2.5K+</div>
                Vendors
              </div>
              <div>
                <div className="text-white text-2xl font-bold">150K+</div>
                Products
              </div>
              <div>
                <div className="text-white text-2xl font-bold">99.9%</div>
                Uptime
              </div>
            </div>
          </div>

          {/* RIGHT (your existing Stripe-style dashboard stays SAME) */}
          <div className="relative">
            {/* glow */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-transparent to-blue-500/10 blur-3xl" />

            {/* grid */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="glass-card relative rounded-[34px] p-6 border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
              {/* HEADER KPI */}
              <div className="rounded-[28px] border border-white/10 bg-[#0A0F1C]/80 p-6 shadow-inner">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Revenue</p>
                    <h2 className="mt-2 text-4xl font-semibold tracking-tight">
                      ₦45.2M
                    </h2>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-green-400 text-sm font-medium">
                        ▲ +18.2%
                      </span>
                      <span className="text-text-secondary text-sm">
                        vs last month
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-green-400 text-xs border border-green-500/20">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Live Metrics
                  </div>
                </div>

                {/* CHART */}
                <div className="mt-6 h-20 w-full">
                  <svg viewBox="0 0 300 80" className="w-full h-full">
                    <defs>
                      <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#6366F1"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#6366F1"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0,60 C40,20 80,90 120,40 C160,0 200,60 240,30 C270,10 300,40 300,20 L300,80 L0,80 Z"
                      fill="url(#rev)"
                    />

                    <path
                      d="M0,60 C40,20 80,90 120,40 C160,0 200,60 240,30 C270,10 300,40"
                      stroke="#6366F1"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* KPI GRID */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between">
                    <p className="text-text-secondary text-sm">Shipments</p>
                    <span className="text-blue-400 text-xs">Auto</span>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <h3 className="text-xl font-semibold">Active</h3>
                    <span className="text-green-400 text-xs">+12%</span>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between">
                    <p className="text-text-secondary text-sm">AI Logistics</p>
                    <span className="text-purple-400 text-xs">Smart</span>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <h3 className="text-xl font-semibold">Optimizing</h3>
                    <span className="text-green-400 text-xs">+8%</span>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between">
                    <p className="text-text-secondary text-sm">Vendors</p>
                    <span className="text-orange-400 text-xs">Network</span>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <h3 className="text-xl font-semibold">1,240+</h3>
                    <span className="text-green-400 text-xs">+24%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionDivider />

      <section className="py-28 hero-grid relative overflow-hidden text-white">
        {/* background glow */}
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-orange-400">
              <Zap size={14} />
              About AutoBridge Commerce
            </div>

            <h2 className="text-4xl font-bold mt-6 leading-tight">
              We are building the infrastructure for{" "}
              <span className="text-orange-400">global commerce</span>
            </h2>

            <p className="text-white/60 mt-6 leading-relaxed">
              AutoBridge Commerce is a next-generation multi-vendor ecosystem
              that connects sellers, buyers, and logistics into one unified
              platform. We empower businesses to scale globally with seamless
              payments, intelligent logistics, and real-time tracking.
            </p>

            <p className="text-white/60 mt-4 leading-relaxed">
              From small entrepreneurs to large enterprises, we provide the
              tools needed to build, sell, and deliver products anywhere in the
              world — faster, smarter, and more securely.
            </p>

            {/* KEY STATS */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              <div>
                <h3 className="text-2xl font-bold text-white">1,240+</h3>
                <p className="text-white/50 text-sm">Active Vendors</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">150K+</h3>
                <p className="text-white/50 text-sm">Orders Delivered</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">32+</h3>
                <p className="text-white/50 text-sm">Countries</p>
              </div>
            </div>
          </div>

          {/* RIGHT FEATURE CARDS */}
          <div className="space-y-4">
            <AboutCard
              icon={<Globe />}
              title="Global Marketplace"
              desc="Sell and buy across borders with integrated international support."
            />

            <AboutCard
              icon={<Truck />}
              title="Smart Logistics"
              desc="Real-time DHL-powered tracking and automated shipping flows."
            />

            <AboutCard
              icon={<ShieldCheck />}
              title="Secure Payments"
              desc="Protected transactions with fraud detection and escrow systems."
            />

            <AboutCard
              icon={<Users />}
              title="Vendor Ecosystem"
              desc="Empowering thousands of entrepreneurs and businesses."
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* FEATURES (DARK ALIGNED VERSION OF YOUR OLD WHITE SECTION) */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">
              Everything you need to scale commerce
            </h2>
            <p className="text-text-secondary mt-4 max-w-2xl mx-auto">
              Logistics, payments, vendors, analytics — all in one unified
              infrastructure system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<ShoppingBag />} title="Marketplace Engine" />
            <FeatureCard icon={<Truck />} title="Smart Logistics" />
            <FeatureCard icon={<BarChart3 />} title="Analytics System" />
            <FeatureCard icon={<Shield />} title="Secure Payments" />
            <FeatureCard icon={<Globe />} title="Global Infrastructure" />
            <FeatureCard icon={<Package />} title="Inventory System" />
          </div>
        </div>
      </section>
      <SectionDivider />
      {/* ================= TRUST SECTION (SOFT GRADIENT) ================= */}
      <section className="py-24 hero-grid relative overflow-hidden text-white">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <img
            src="https://plus.unsplash.com/premium_photo-1682097895977-b02a99df2a27?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFmcmljYW4lMjBidXNpbmVzcyUyMHdvbWFufGVufDB8fDB8fHww"
            className="rounded-2xl shadow-xl"
          />

          <div>
            <h2 className="text-4xl font-bold">
              Built for Nigerian entrepreneurs
            </h2>

            <p className="text-gray-600 mt-4">
              Join thousands scaling their businesses with enterprise-grade
              infrastructure.
            </p>

            <div className="mt-8 space-y-4">
              <Trust icon={<CheckCircle2 />} title="Quick Setup" />
              <Trust icon={<Users />} title="Dedicated Support" />
              <Trust icon={<TrendingUp />} title="Fast Payments" />
            </div>
          </div>
        </div>
      </section>
      <SectionDivider />
      {/* ================= CTA (DARK ORANGE FOCUS) ================= */}
      <section className="py-24 hero-grid relative overflow-hidden text-white text-center">
        <h2 className="text-4xl font-bold">
          Ready to scale your commerce operations?
        </h2>

        <p className="text-text-secondary mt-4 mb-10">
          Join AutoBridge Commerce today.
        </p>
          <Link
            href="/account"
            className="mt-8 bg-primary px-10 py-4 rounded-2xl font-semibold"
          >
            Get Started
          </Link>
        
      </section>
    </>
  );
}

/* reusable component */
function FeatureCard({ icon, title }: any) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-text-secondary text-sm mt-2">
        Enterprise-grade module for scalable commerce operations.
      </p>
    </div>
  );
}

function Trust({ icon, title }: any) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-green-500">{icon}</div>
      <div>
        <h4 className="font-semibold white">{title}</h4>
        <p className="text-gray-600 text-sm">
          Optimized for reliability and scale.
        </p>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="relative w-full overflow-hidden py-5">
      {/* core glow (tight + visible) */}
      <div className="absolute left-1/2 top-1/2 h-[2px] w-[28%] -translate-x-1/2 -translate-y-1/2 bg-[#ff6b35] blur-[10px] opacity-80" />

      {/* outer soft bloom */}
      <div className="absolute left-1/2 top-1/2 h-[1px] w-[45%] -translate-x-1/2 -translate-y-1/2 bg-[#ff6b35] blur-[22px] opacity-40" />

      {/* micro sharp core (this is what makes it visible) */}
      <div className="absolute left-1/2 top-1/2 h-[1px] w-[22%] -translate-x-1/2 -translate-y-1/2 bg-[#ff6b35] opacity-90" />
    </div>
  );
}

function AboutCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition">
      <div className="text-orange-400 mt-1">{icon}</div>

      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-white/50 text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

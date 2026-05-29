import Link from "next/link";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
// import AppShell from "./layouts/AppShell";
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
  Wheat,
  UtensilsCrossed,
  Shirt,
  Car,
  Tag,
  Brain,
  FileText,
  MapPin,
  Clock,
  Sparkles,
  Search,
  UserCheck,
  Tractor,
  Store,
  Layers,
  Scissors,
  Wrench,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero-grid relative overflow-hidden">
        <div className="mx-auto grid min-h-[90vh] max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2">
          {/* LEFT CONTENT */}
          <div>
            <div className="mb-6 inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm text-primary">
              Enterprise Commerce Infrastructure
            </div>

            <h1 className="max-w-2xl text-6xl font-bold leading-tight text-primary-theme">
              Africa's Global{" "}
              <span className="gradient-text">Trade Marketplace</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-secondary-theme">
              Buy, sell, export, and ship African agro products, packaged foods,
              fashion prints, and auto parts globally with an AI-powered
              commerce platform.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-theme">
              AutoBridge Commerce connects African producers, exporters,
              wholesalers, retailers, and global buyers through one intelligent
              marketplace and fulfillment infrastructure.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/account"
                className="rounded-2xl bg-primary px-8 py-4 font-semibold text-white shadow-glow hover:scale-105 transition"
              >
                Start Selling Globally
              </Link>

              <Link
                href="/marketplace"
                className="glass-card rounded-2xl px-8 py-4 text-primary-theme hover:bg-surface-2 transition"
              >
                Explore African Products
              </Link>
            </div>

            {/* CATEGORY PILLS */}
            <div className="mt-10 flex flex-wrap gap-2">
              {[
                "Agro Exports",
                "Packaged African Foods",
                "African Fashion Prints",
                "Auto Parts Imports",
                "Global Shipping",
                "DHL Fulfillment",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-theme hover:border-primary/40 hover:text-primary transition cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* QUICK STATS */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-sm text-muted-theme">
              <div>
                <div className="text-2xl font-bold text-primary-theme">5K+</div>
                Vendors
              </div>

              <div>
                <div className="text-2xl font-bold text-primary-theme">
                  150K+
                </div>
                Products
              </div>

              <div>
                <div className="text-2xl font-bold text-primary-theme">
                  99.9%
                </div>
                Uptime
              </div>
            </div>
          </div>

          {/* RIGHT DASHBOARD */}
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-transparent to-blue-500/10 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="glass-card relative rounded-[34px] p-6 overflow-hidden">
              {/* HEADER */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-primary-theme tracking-tight">
                    AutoBridge Commerce
                  </h2>
                  <p className="text-xs text-muted-theme mt-0.5">
                    Powering African Trade, Exports & Global Commerce
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-primary text-xs border border-primary-border">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  AI-Powered
                </div>
              </div>

              {/* MAIN HERO CARD */}
              <div className="rounded-[28px] border border-border bg-surface-deep p-6 shadow-lg">
                <p className="text-xs uppercase tracking-widest text-muted-theme mb-2">
                  Africa's Global Trade Marketplace
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-primary-theme leading-tight">
                  Buy, sell, export &amp; ship
                  <br />
                  African products globally
                </h2>
                <p className="mt-3 text-sm text-muted-theme leading-relaxed">
                  Connecting African producers, exporters, wholesalers,
                  retailers, and global buyers through one intelligent
                  marketplace and fulfillment infrastructure.
                </p>

                {/* CTA BUTTONS */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                    Start Selling Globally
                  </button>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-surface-deep px-5 py-2 text-sm font-medium text-primary-theme hover:bg-primary-light transition-colors">
                    Explore African Products
                  </button>
                </div>

                {/* CATEGORY PILLS */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    "Agro Exports",
                    "Packaged Foods",
                    "Fashion Prints",
                    "Auto Parts",
                    "Global Shipping",
                    "DHL Fulfillment",
                  ].map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-border bg-primary-light px-3 py-1 text-xs text-muted-theme"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              {/* METRICS ROW */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "African Vendors",
                    value: "5,000+",
                    badge: "Active",
                  },
                  {
                    label: "Products Shipped",
                    value: "1M+",
                    badge: "Fulfilled",
                  },
                  {
                    label: "Global Destinations",
                    value: "75+",
                    badge: "Countries",
                  },
                  {
                    label: "DHL Logistics",
                    value: "Integrated",
                    badge: "Live",
                  },
                ].map(({ label, value, badge }) => (
                  <div
                    key={label}
                    className="glass-card p-4 rounded-2xl border border-border hover-surface"
                  >
                    <div className="flex justify-between">
                      <p className="text-muted-theme text-sm">{label}</p>
                      <span className="text-primary text-xs">{badge}</span>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-xl font-semibold text-primary-theme">
                        {value}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* FEATURE GRID */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                {[
                  {
                    label: "Agro Marketplace",
                    badge: "Export",
                    value: "Cocoa · Cashew · Sesame · Ginger · Grains",
                    delta: "5,000+ SKUs",
                  },
                  {
                    label: "Packaged African Foods",
                    badge: "Distribute",
                    value: "Garri · Palm Oil · Plantain Chips · Spices",
                    delta: "Local & Global",
                  },
                  {
                    label: "Fashion & Textile Exports",
                    badge: "Showcase",
                    value: "Ankara · Adire · Apparel · Accessories",
                    delta: "Worldwide",
                  },
                  {
                    label: "Auto Parts Marketplace",
                    badge: "Source",
                    value: "Engine · Brakes · Suspension · Electronics",
                    delta: "OEM & Aftermarket",
                  },
                ].map(({ label, badge, value, delta }) => (
                  <div
                    key={label}
                    className="glass-card p-4 rounded-2xl border border-border hover-surface"
                  >
                    <div className="flex justify-between">
                      <p className="text-muted-theme text-sm">{label}</p>
                      <span className="text-primary text-xs">{badge}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-end">
                      <h3 className="text-sm font-semibold text-primary-theme leading-snug">
                        {value}
                      </h3>
                      <span className="text-green-500 text-xs whitespace-nowrap ml-3">
                        {delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* DHL LOGISTICS STRIP */}
              <div className="mt-6 rounded-2xl border border-border bg-surface-deep p-4">
                <p className="text-xs uppercase tracking-widest text-muted-theme mb-3">
                  DHL-Integrated Fulfillment
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Waybill Generation",
                    "Pickup Scheduling",
                    "Export Tracking",
                    "Customs Documentation",
                    "Global Delivery",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-border bg-primary-light px-3 py-1.5 text-xs text-muted-theme"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* ABOUT SECTION */}
      <section className="py-28 hero-grid relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE */}
          <div>
            {/* BADGE */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-primary">
              <Zap size={14} />
              About AutoBridge Commerce
            </div>

            {/* TITLE */}
            <h2 className="text-4xl font-bold mt-6 leading-tight text-primary-theme">
              The Future of{" "}
              <span className="text-primary">
                African Trade & Export Infrastructure
              </span>
            </h2>

            {/* DESCRIPTION */}
            <p className="text-secondary-theme mt-6 leading-relaxed">
              AutoBridge Commerce is an AI-powered multi-vendor marketplace
              designed to simplify African trade, exports, logistics, and
              international commerce.
            </p>

            <p className="text-muted-theme mt-4 leading-relaxed">
              We help businesses sell and export:
            </p>

            {/* LIST */}
            <ul className="mt-3 space-y-2">
              {[
                "Agricultural commodities",
                "Processed and packaged African foods",
                "African fashion and textile products",
                "Automotive spare parts and accessories",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-muted-theme text-sm"
                >
                  <CheckCircle2 size={15} className="text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* EXTRA TEXT */}
            <p className="text-muted-theme mt-6 leading-relaxed text-sm">
              Our platform combines ecommerce, AI-powered operations, payment
              infrastructure, and DHL-integrated logistics to enable seamless
              local and international trade.
            </p>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              <div>
                <h3 className="text-2xl font-bold text-primary-theme">5k+</h3>
                <p className="text-muted-theme text-sm">Active Vendors</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-primary-theme">1M+</h3>
                <p className="text-muted-theme text-sm">Orders Delivered</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-primary-theme">32+</h3>
                <p className="text-muted-theme text-sm">Countries</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (CARDS) */}
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

      {/* FEATURES GRID */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-theme">
              Everything you need to scale commerce
            </h2>

            <p className="text-secondary-theme mt-4 max-w-2xl mx-auto">
              Logistics, payments, vendors, analytics — all in one unified
              infrastructure system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Wheat />}
              title="African Agro Marketplace"
              desc="Sell and export agricultural products including cocoa, cashew, sesame, ginger, coffee, spices, grains, and more."
            />

            <FeatureCard
              icon={<UtensilsCrossed />}
              title="Packaged Food Commerce"
              desc="Distribute packaged African food products with integrated fulfillment and shipping."
            />

            <FeatureCard
              icon={<Shirt />}
              title="African Fashion & Textile Exports"
              desc="Showcase and export African fabrics, Ankara prints, and apparel globally."
            />

            <FeatureCard
              icon={<Car />}
              title="Auto Parts Import Marketplace"
              desc="Source and distribute automotive spare parts efficiently across Africa."
            />
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* DHL LOGISTICS SECTION */}
      <section className="py-28 hero-grid relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-primary">
              <Truck size={14} />
              DHL-Powered Fulfillment
            </div>

            <h2 className="text-4xl font-bold mt-6 leading-tight text-primary-theme">
              Integrated Global Shipping &{" "}
              <span className="text-primary">Export Fulfillment</span>
            </h2>

            <p className="text-secondary-theme mt-6 leading-relaxed">
              AutoBridge Commerce automates logistics for African businesses
              through DHL-powered fulfillment infrastructure.
            </p>

            <p className="text-secondary-theme mt-3 leading-relaxed">
              From pickup to international delivery, vendors can:
            </p>

            <ul className="mt-5 space-y-3">
              {[
                { icon: <Tag size={15} />, text: "Generate shipping labels" },
                { icon: <Clock size={15} />, text: "Schedule pickups" },
                {
                  icon: <MapPin size={15} />,
                  text: "Track exports in real time",
                },
                {
                  icon: <FileText size={15} />,
                  text: "Manage customs documentation",
                },
                { icon: <Globe size={15} />, text: "Deliver globally" },
              ].map(({ icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-secondary-theme text-sm"
                >
                  <span className="text-primary">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — DHL tracking card */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary/10 via-transparent to-blue-500/10 blur-2xl" />

            <div className="glass-card relative rounded-[28px] border border-border bg-surface/40 backdrop-blur-xl p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary-theme">
                  Live Shipment Tracker
                </p>

                <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-green-500 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  DHL Live
                </span>
              </div>

              {/* Shipment rows */}
              {[
                {
                  id: "AB-NG-00124",
                  origin: "Lagos, NG",
                  dest: "London, UK",
                  status: "In Transit",
                  pct: 68,
                  color: "bg-blue-500",
                },
                {
                  id: "AB-NG-00098",
                  origin: "Kano, NG",
                  dest: "Dubai, UAE",
                  status: "Customs Cleared",
                  pct: 85,
                  color: "bg-orange-500",
                },
                {
                  id: "AB-NG-00211",
                  origin: "Accra, GH",
                  dest: "Toronto, CA",
                  status: "Out for Delivery",
                  pct: 95,
                  color: "bg-green-500",
                },
              ].map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-theme font-mono">
                      {s.id}
                    </span>
                    <span className="text-xs text-primary">{s.status}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-secondary-theme mb-3">
                    <span>{s.origin}</span>
                    <ArrowRight size={12} className="text-primary" />
                    <span>{s.dest}</span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-border">
                    <div
                      className={`h-1.5 rounded-full ${s.color}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>

                  <p className="text-right text-xs text-muted-theme mt-1">
                    {s.pct}% complete
                  </p>
                </div>
              ))}

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: "Avg Delivery", value: "3.2 days" },
                  { label: "On-Time Rate", value: "98.4%" },
                  { label: "Destinations", value: "75+" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-surface border border-border p-3 text-center"
                  >
                    <p className="text-primary-theme font-semibold text-sm">
                      {value}
                    </p>
                    <p className="text-muted-theme text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* AI SECTION */}
      <section className="py-28 hero-grid relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT — AI capability cards */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/15 via-transparent to-purple-500/10 blur-2xl" />

            <div className="relative grid grid-cols-2 gap-4">
              {[
                {
                  icon: <Tag size={18} />,
                  title: "Listing Generator",
                  desc: "Auto-generate product listings from photos and descriptions.",
                },
                {
                  icon: <Layers size={18} />,
                  title: "Auto-Categorization",
                  desc: "AI assigns products to the right categories instantly.",
                },
                {
                  icon: <Zap size={18} />,
                  title: "Workflow Optimizer",
                  desc: "Streamlines export workflows end-to-end automatically.",
                },
                {
                  icon: <BarChart3 size={18} />,
                  title: "Cost Predictor",
                  desc: "Forecasts logistics costs before you ship.",
                },
                {
                  icon: <Search size={18} />,
                  title: "Product Discovery",
                  desc: "Improves search rankings and buyer discoverability.",
                },
                {
                  icon: <Sparkles size={18} />,
                  title: "Personalization",
                  desc: "Delivers tailored buying experiences for every user.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="glass-card rounded-2xl border border-border bg-surface hover:bg-surface-2 transition p-4"
                >
                  <div className="text-primary mb-3">{icon}</div>

                  <h4 className="text-sm font-semibold text-primary-theme">
                    {title}
                  </h4>

                  <p className="text-muted-theme text-xs mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-primary">
              <Brain size={14} />
              Powered by AI
            </div>

            <h2 className="text-4xl font-bold mt-6 leading-tight text-primary-theme">
              AI-Powered Trade <span className="text-primary">& Commerce</span>
            </h2>

            <p className="text-secondary-theme mt-6 leading-relaxed">
              Our AI systems help vendors work smarter and sell more — from the
              moment a product is listed to the moment it reaches its
              destination.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Generate product listings",
                "Categorize products automatically",
                "Optimize export workflows",
                "Predict logistics costs",
                "Improve product discovery",
                "Deliver personalized buying experiences",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-secondary-theme text-sm"
                >
                  <CheckCircle2 size={15} className="text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* VENDOR SECTION */}
      <section className="py-28 hero-grid relative overflow-hidden text-primary-theme">
        <div className="mx-auto max-w-7xl px-6 text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-glass px-4 py-2 text-sm text-orange-400 mb-6">
            <UserCheck size={14} />
            Vendor Programme
          </div>

          <h2 className="text-4xl font-bold">
            Built for African{" "}
            <span className="text-orange-400">Vendors & Exporters</span>
          </h2>

          <p className="text-secondary-theme mt-4 max-w-xl mx-auto">
            Whether you are a farmer or a global fashion brand, AutoBridge
            Commerce provides the infrastructure to scale globally.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Tractor size={22} />,
              title: "Farmer",
              desc: "List and export raw agricultural produce directly to global buyers.",
            },
            {
              icon: <Package size={22} />,
              title: "Agro Exporter",
              desc: "Manage bulk commodity exports with automated documentation and DHL shipping.",
            },
            {
              icon: <Store size={22} />,
              title: "Food Distributor",
              desc: "Distribute packaged African foods to retailers and consumers worldwide.",
            },
            {
              icon: <Shirt size={22} />,
              title: "Fashion Brand",
              desc: "Showcase African-designed apparel and accessories to an international audience.",
            },
            {
              icon: <Scissors size={22} />,
              title: "Textile Merchant",
              desc: "Sell Ankara, Kente, Adire, and other African fabrics to global markets.",
            },
            {
              icon: <Wrench size={22} />,
              title: "Auto Parts Dealer",
              desc: "Source and distribute automotive spare parts efficiently across Africa.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="glass-card rounded-2xl border border-border bg-surface-glass p-6 hover:bg-surface-secondary transition group"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 mb-4 group-hover:bg-orange-400/20 transition">
                {icon}
              </div>

              <h4 className="font-semibold text-primary-theme">{title}</h4>

              <p className="text-secondary-theme text-sm mt-2 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-theme text-sm mt-10">
          AutoBridge Commerce provides the infrastructure to scale globally.
        </p>
      </section>
      <SectionDivider />

      {/* METRICS SECTION */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-primary-theme">
              Platform at a Glance
            </h2>

            <p className="text-secondary-theme mt-4">
              The numbers behind Africa's fastest-growing trade platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                value: "5,000+",
                label: "African Vendors",
                icon: <Users size={20} />,
              },
              {
                value: "1M+",
                label: "Products Shipped",
                icon: <Package size={20} />,
              },
              {
                value: "75+",
                label: "Global Delivery Destinations",
                icon: <Globe size={20} />,
              },
              {
                value: "DHL",
                label: "Logistics Integration",
                icon: <Truck size={20} />,
              },
              {
                value: "AI",
                label: "Commerce Infrastructure",
                icon: <Brain size={20} />,
              },
            ].map(({ value, label, icon }) => (
              <div
                key={label}
                className="glass-card rounded-2xl border border-border bg-surface-glass p-6 text-center hover:bg-surface-secondary transition"
              >
                <div className="flex justify-center text-orange-400 mb-3">
                  {icon}
                </div>

                <h3 className="text-3xl font-bold text-primary-theme">
                  {value}
                </h3>

                <p className="text-muted-theme text-xs mt-2 leading-snug">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* TRUST SECTION */}
      <section className="py-24 hero-grid relative overflow-hidden bg-background text-primary-theme">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <img
            src="https://plus.unsplash.com/premium_photo-1682097895977-b02a99df2a27?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFmcmljYW4lMjBidXNpbmVzcyUyMHdvbWFufGVufDB8fDB8fHww"
            className="rounded-2xl shadow-lg border border-border"
            alt="African entrepreneur"
          />

          <div>
            <h2 className="text-4xl font-bold text-primary-theme">
              Built for Nigerian entrepreneurs
            </h2>

            <p className="text-secondary-theme mt-4">
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

      {/* FINAL CTA */}
      <section className="py-32 hero-grid relative overflow-hidden text-center text-primary-theme bg-background">
        <div className="absolute -inset-0 bg-gradient-to-b from-primary/10 via-transparent to-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-3xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-glass px-4 py-2 text-sm text-orange-400 mb-8">
            <Globe size={14} />
            Africa to the World
          </div>

          <h2 className="text-5xl font-bold leading-tight text-primary-theme">
            Export Africa <span className="text-orange-400">To The World</span>
          </h2>

          <p className="text-secondary-theme mt-6 text-lg leading-relaxed max-w-xl mx-auto">
            Sell African products globally through one unified AI-powered
            commerce and logistics platform.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/account"
              className="rounded-2xl bg-primary px-10 py-4 font-semibold shadow-glow hover:scale-105 transition text-white"
            >
              Become A Vendor
            </Link>

            <Link
              href="/marketplace"
              className="glass-card rounded-2xl px-10 py-4 hover:bg-surface-secondary transition border border-border"
            >
              Start Global Selling
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

/* ─── Reusable components ─── */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-border bg-surface-glass hover:bg-surface-secondary transition">
      <div className="text-primary mb-4">{icon}</div>

      <h3 className="text-lg font-semibold text-primary-theme">{title}</h3>

      <p className="text-secondary-theme text-sm mt-2">{desc}</p>
    </div>
  );
}

function Trust({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-green-500">{icon}</div>

      <div>
        <h4 className="font-semibold text-primary-theme">{title}</h4>

        <p className="text-muted-theme text-sm">
          Optimized for reliability and scale.
        </p>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="relative w-full overflow-hidden py-5">
      <div className="absolute left-1/2 top-1/2 h-[2px] w-[28%] -translate-x-1/2 -translate-y-1/2 bg-primary blur-[10px] opacity-70" />

      <div className="absolute left-1/2 top-1/2 h-[1px] w-[45%] -translate-x-1/2 -translate-y-1/2 bg-primary blur-[22px] opacity-30" />

      <div className="absolute left-1/2 top-1/2 h-[1px] w-[22%] -translate-x-1/2 -translate-y-1/2 bg-primary opacity-80" />
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
    <div className="flex gap-4 p-5 rounded-2xl border border-border bg-surface-glass backdrop-blur-md hover:bg-surface-secondary transition">
      <div className="text-orange-400 mt-1">{icon}</div>

      <div>
        <h4 className="font-semibold text-primary-theme">{title}</h4>

        <p className="text-muted-theme text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

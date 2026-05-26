"use client";

import { useState } from "react";
import {
  Save,
  Shield,
  DollarSign,
  Truck,
  Globe,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: "AutoBridge Commerce",
    commissionRate: 12,
    autoPayouts: true,
    allowGuestCheckout: false,
    enableLogisticsAI: true,
    maintenanceMode: false,
  });

  const update = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    console.log("Saving settings:", settings);
    alert("Settings saved (mock)");
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">System Control Center</h1>
        <p className="text-white/50 text-sm">
          Manage platform-wide configuration and behavior
        </p>
      </div>

      {/* GENERAL */}
      <Section title="General Settings" icon={<Globe size={18} />}>
        <Field label="Platform Name">
          <input
            value={settings.platformName}
            onChange={(e) => update("platformName", e.target.value)}
            className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-xl"
          />
        </Field>

        <Field label="Maintenance Mode">
          <Toggle
            enabled={settings.maintenanceMode}
            onChange={(v) => update("maintenanceMode", v)}
          />
        </Field>
      </Section>

      {/* FINANCE */}
      <Section title="Finance & Payments" icon={<DollarSign size={18} />}>
        <Field label="Commission Rate (%)">
          <input
            type="number"
            value={settings.commissionRate}
            onChange={(e) => update("commissionRate", e.target.value)}
            className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-xl"
          />
        </Field>

        <Field label="Auto Vendor Payouts">
          <Toggle
            enabled={settings.autoPayouts}
            onChange={(v) => update("autoPayouts", v)}
          />
        </Field>
      </Section>

      {/* LOGISTICS */}
      <Section title="Logistics Engine" icon={<Truck size={18} />}>
        <Field label="AI Route Optimization">
          <Toggle
            enabled={settings.enableLogisticsAI}
            onChange={(v) => update("enableLogisticsAI", v)}
          />
        </Field>

        <Field label="Allow Guest Checkout">
          <Toggle
            enabled={settings.allowGuestCheckout}
            onChange={(v) => update("allowGuestCheckout", v)}
          />
        </Field>
      </Section>

      {/* DANGER ZONE */}
      <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-red-400 font-semibold">
          <AlertTriangle size={18} />
          Danger Zone
        </div>

        <p className="text-white/50 text-sm mt-2">
          These actions affect the entire platform
        </p>

        <button className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl">
          Reset System Cache
        </button>
      </div>

      {/* SAVE */}
      <button
        onClick={saveSettings}
        className="flex items-center gap-2 bg-orange-500 px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
      >
        <Save size={18} />
        Save Changes
      </button>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-orange-400 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-white/60">{label}</p>
      {children}
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
        enabled
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-white/5 border-white/10 text-white/50"
      }`}
    >
      {enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      {enabled ? "Enabled" : "Disabled"}
    </button>
  );
}
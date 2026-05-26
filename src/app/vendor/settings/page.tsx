"use client";

import { useEffect, useState } from "react";
import AppShell from "../../layouts/AppShell";
import { Save, Shield, Bell, User, Store, KeyRound } from "lucide-react";

/* ================= TYPES ================= */

type Settings = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyAddress: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  twoFactor: boolean;
};

/* ================= STORAGE ================= */

const STORAGE_KEY = "autobridge_vendor_settings";

const defaultSettings: Settings = {
  fullName: "Vendor User",
  email: "vendor@autobridge.com",
  phone: "",
  companyName: "AutoBridge Vendor",
  companyAddress: "",
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  twoFactor: false,
};

function getSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return JSON.parse(raw);
  } catch {
    return defaultSettings;
  }
}

function saveSettings(data: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ================= PAGE ================= */

export default function VendorSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  /* LOAD */
  useEffect(() => {
    setSettings(getSettings());
    setLoading(false);
  }, []);

  /* AUTO SAVE */
  useEffect(() => {
    if (!loading) {
      saveSettings(settings);
    }
  }, [settings, loading]);

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-6 text-white">Loading settings...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0B1120] text-white p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-white/50 mt-1">
              Manage your vendor account & preferences
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl"
          >
            <Save size={16} />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PROFILE */}
          <Section title="Profile" icon={<User size={18} />}>
            <Input
              label="Full Name"
              value={settings.fullName}
              onChange={(v) =>
                setSettings({ ...settings, fullName: v })
              }
            />
            <Input
              label="Email"
              value={settings.email}
              onChange={(v) =>
                setSettings({ ...settings, email: v })
              }
            />
            <Input
              label="Phone"
              value={settings.phone}
              onChange={(v) =>
                setSettings({ ...settings, phone: v })
              }
            />
          </Section>

          {/* BUSINESS */}
          <Section title="Business" icon={<Store size={18} />}>
            <Input
              label="Company Name"
              value={settings.companyName}
              onChange={(v) =>
                setSettings({ ...settings, companyName: v })
              }
            />
            <Input
              label="Company Address"
              value={settings.companyAddress}
              onChange={(v) =>
                setSettings({ ...settings, companyAddress: v })
              }
            />
          </Section>

          {/* NOTIFICATIONS */}
          <Section title="Notifications" icon={<Bell size={18} />}>
            <Toggle
              label="Email Notifications"
              checked={settings.notifications.email}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    email: v,
                  },
                })
              }
            />

            <Toggle
              label="SMS Notifications"
              checked={settings.notifications.sms}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    sms: v,
                  },
                })
              }
            />

            <Toggle
              label="Push Notifications"
              checked={settings.notifications.push}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    push: v,
                  },
                })
              }
            />
          </Section>

          {/* SECURITY */}
          <Section title="Security" icon={<Shield size={18} />}>
            <Toggle
              label="Two-Factor Authentication"
              checked={settings.twoFactor}
              onChange={(v) =>
                setSettings({ ...settings, twoFactor: v })
              }
            />

            <div className="mt-4">
              <button className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl hover:bg-white/10">
                Change Password
              </button>
            </div>
          </Section>

          {/* API KEYS (FUTURE READY) */}
          <Section title="API Access" icon={<KeyRound size={18} />}>
            <div className="text-white/50 text-sm mb-3">
              Generate API keys for integrations (coming soon)
            </div>

            <button className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl hover:bg-white/10">
              Generate API Key
            </button>
          </Section>

        </div>
      </div>
    </AppShell>
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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 text-orange-400 font-medium">
        {icon}
        <h2>{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-white/60">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-orange-500"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-orange-500"
      />
    </div>
  );
}
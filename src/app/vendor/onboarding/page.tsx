"use client";

import { useState } from "react";
import {
  Building2,
  User,
  FileText,
  CreditCard,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

export default function VendorOnboardingPage() {
  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    taxId: "",
    bankName: "",
    accountNumber: "",
  });

  const steps = [
    { id: 1, label: "Business", icon: Building2 },
    { id: 2, label: "Contact", icon: User },
    { id: 3, label: "Documents", icon: FileText },
    { id: 4, label: "Payouts", icon: CreditCard },
    { id: 5, label: "Review", icon: CheckCircle2 },
  ];

  const next = () => setStep((s) => Math.min(5, s + 1) as Step);
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white px-6 py-10">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Become a <span className="text-orange-400">Vendor</span>
          </h1>
          <p className="text-white/50 mt-2">
            Complete your onboarding to start selling on AutoBridge
          </p>
        </div>

        {/* PROGRESS */}
        <div className="flex justify-between mb-10 relative">

          <div className="absolute top-5 left-0 right-0 h-[2px] bg-white/10" />

          {steps.map((s) => {
            const Icon = s.icon;

            return (
              <div key={s.id} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                    step >= s.id
                      ? "bg-orange-500 border-orange-500"
                      : "border-white/20"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <p className="text-xs text-white/50 mt-2">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* FORM CARD */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Business Information</h2>

              <input
                placeholder="Business Name"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
              />

              <select
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, businessType: e.target.value })
                }
              >
                <option value="">Business Type</option>
                <option value="llc">LLC</option>
                <option value="sole">Sole Proprietor</option>
                <option value="company">Company</option>
              </select>

              <input
                placeholder="Tax ID"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, taxId: e.target.value })
                }
              />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact Details</h2>

              <input
                placeholder="Email"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <input
                placeholder="Phone Number"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                placeholder="Business Address"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Documents</h2>

              <div className="border border-white/10 bg-white/5 p-6 rounded-xl text-center">
                <Upload className="mx-auto mb-3" />
                <p className="text-white/60 text-sm">
                  Upload Business Registration Certificate
                </p>
              </div>

              <div className="border border-white/10 bg-white/5 p-6 rounded-xl text-center">
                <Upload className="mx-auto mb-3" />
                <p className="text-white/60 text-sm">
                  Upload Government ID
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Payout Details</h2>

              <input
                placeholder="Bank Name"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, bankName: e.target.value })
                }
              />

              <input
                placeholder="Account Number"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value })
                }
              />
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Review</h2>

              <div className="text-sm text-white/60 space-y-1">
                <p><b>Business:</b> {form.businessName}</p>
                <p><b>Email:</b> {form.email}</p>
                <p><b>Phone:</b> {form.phone}</p>
                <p><b>Bank:</b> {form.bankName}</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-sm">
                Ready to submit your vendor application
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="flex justify-between mt-8">

            <button
              onClick={back}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 disabled:opacity-40"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {step < 5 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-2 bg-orange-500 rounded-xl"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button className="flex items-center gap-2 px-5 py-2 bg-green-500 rounded-xl">
                <CheckCircle2 size={16} />
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
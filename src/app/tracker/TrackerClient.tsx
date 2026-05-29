"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, MapPin, CheckCircle2, Clock, Navigation, CircleDot,
  Truck, Loader2, AlertCircle, RefreshCw, Package, ExternalLink, FlaskConical,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type TrackingEvent = {
  status:      string;
  location:    string;
  timestamp:   string;
  description: string;
  remark?:     string;
};

type ShipmentData = {
  trackingNumber: string;
  carrier:        string;
  status:         string;
  statusCode:     string;
  eta:            string;
  progress:       number;
  events:         TrackingEvent[];
};

/* ─────────────────────────────────────────────
   SIMULATION STAGES
   Pressing "Next Stage" advances through these
   so you can test the full UI flow without
   needing a real DHL response.
───────────────────────────────────────────── */
function buildSimStages(trackingNumber: string): ShipmentData[] {
  const now = new Date();
  const ts = (offsetHours: number) =>
    new Date(now.getTime() - offsetHours * 3_600_000).toISOString();

  return [
    {
      trackingNumber, carrier: "DHL Express",
      status: "Shipment Picked Up", statusCode: "transit", eta: "3–5 Business Days", progress: 15,
      events: [
        { status: "Label Created",    location: "Lagos, Nigeria",    timestamp: ts(6),  description: "Shipment label created by vendor" },
        { status: "Shipment Picked Up", location: "DHL Lagos Hub",  timestamp: ts(2),  description: "Package collected by DHL courier" },
      ],
    },
    {
      trackingNumber, carrier: "DHL Express",
      status: "In Transit — Departed Origin", statusCode: "transit", eta: "2–4 Business Days", progress: 35,
      events: [
        { status: "Label Created",    location: "Lagos, Nigeria",              timestamp: ts(10), description: "Shipment label created by vendor" },
        { status: "Shipment Picked Up", location: "DHL Lagos Hub",             timestamp: ts(6),  description: "Package collected by DHL courier" },
        { status: "Departed Facility", location: "Lagos International Airport", timestamp: ts(1), description: "Shipment departed origin facility" },
      ],
    },
    {
      trackingNumber, carrier: "DHL Express",
      status: "In Transit — International", statusCode: "transit", eta: "1–2 Business Days", progress: 55,
      events: [
        { status: "Label Created",    location: "Lagos, Nigeria",              timestamp: ts(20), description: "Shipment label created by vendor" },
        { status: "Shipment Picked Up", location: "DHL Lagos Hub",             timestamp: ts(16), description: "Package collected by DHL courier" },
        { status: "Departed Facility", location: "Lagos International Airport", timestamp: ts(12), description: "Shipment departed origin facility" },
        { status: "Arrived at Hub",    location: "DHL Hub Frankfurt, Germany", timestamp: ts(4),  description: "Shipment arrived at international hub" },
        { status: "Customs Clearance", location: "DHL Hub Frankfurt, Germany", timestamp: ts(2),  description: "Shipment cleared customs" },
      ],
    },
    {
      trackingNumber, carrier: "DHL Express",
      status: "With Delivery Courier", statusCode: "out-for-delivery", eta: "Today", progress: 85,
      events: [
        { status: "Label Created",    location: "Lagos, Nigeria",              timestamp: ts(48), description: "Shipment label created by vendor" },
        { status: "Shipment Picked Up", location: "DHL Lagos Hub",             timestamp: ts(44), description: "Package collected by DHL courier" },
        { status: "Departed Facility", location: "Lagos International Airport", timestamp: ts(40), description: "Shipment departed origin facility" },
        { status: "Arrived at Hub",    location: "DHL Hub Frankfurt, Germany", timestamp: ts(30), description: "Shipment arrived at international hub" },
        { status: "Customs Clearance", location: "DHL Hub Frankfurt, Germany", timestamp: ts(28), description: "Shipment cleared customs" },
        { status: "Arrived at Delivery Facility", location: "DHL Service Point, Destination", timestamp: ts(5), description: "Shipment arrived at local delivery facility" },
        { status: "With Delivery Courier", location: "Destination City",       timestamp: ts(1),  description: "Courier is on the way to the recipient" },
      ],
    },
    {
      trackingNumber, carrier: "DHL Express",
      status: "Delivered", statusCode: "delivered", eta: "Delivered", progress: 100,
      events: [
        { status: "Label Created",    location: "Lagos, Nigeria",              timestamp: ts(72), description: "Shipment label created by vendor" },
        { status: "Shipment Picked Up", location: "DHL Lagos Hub",             timestamp: ts(68), description: "Package collected by DHL courier" },
        { status: "Departed Facility", location: "Lagos International Airport", timestamp: ts(64), description: "Shipment departed origin facility" },
        { status: "Arrived at Hub",    location: "DHL Hub Frankfurt, Germany", timestamp: ts(54), description: "Shipment arrived at international hub" },
        { status: "Customs Clearance", location: "DHL Hub Frankfurt, Germany", timestamp: ts(52), description: "Shipment cleared customs" },
        { status: "Arrived at Delivery Facility", location: "DHL Service Point, Destination", timestamp: ts(29), description: "Shipment arrived at local delivery facility" },
        { status: "With Delivery Courier", location: "Destination City",       timestamp: ts(25), description: "Courier is on the way to the recipient" },
        { status: "Delivered",         location: "Customer Address",           timestamp: ts(0),  description: "Package delivered — signed by recipient", remark: "Signed by: CUSTOMER" },
      ],
    },
  ];
}

/* ─────────────────────────────────────────────
   SANDBOX MOCKS — quick demo numbers
───────────────────────────────────────────── */
const SANDBOX_MOCKS: Record<string, ShipmentData> = {
  "DHL-123456": {
    trackingNumber: "DHL-123456", carrier: "DHL Express",
    status: "In Transit", statusCode: "transit", eta: "2–3 Business Days", progress: 60,
    events: [
      { status: "Label Created",  location: "Lagos, Nigeria",               timestamp: "2026-05-26T10:00:00Z", description: "Shipment label created by vendor" },
      { status: "Picked Up",      location: "DHL Lagos Hub",                timestamp: "2026-05-26T14:30:00Z", description: "Package collected by DHL courier" },
      { status: "In Transit",     location: "International Sorting Centre", timestamp: "2026-05-27T08:00:00Z", description: "Package en route to destination country" },
    ],
  },
  "DHL-999999": {
    trackingNumber: "DHL-999999", carrier: "DHL Express",
    status: "Out for Delivery", statusCode: "out-for-delivery", eta: "Today", progress: 90,
    events: [
      { status: "Label Created",    location: "Ibadan, Nigeria",        timestamp: "2026-05-25T08:15:00Z", description: "Order placed and label generated" },
      { status: "Picked Up",        location: "DHL Ibadan Centre",      timestamp: "2026-05-25T11:30:00Z", description: "Shipment picked up" },
      { status: "In Transit",       location: "DHL Hub Lagos",          timestamp: "2026-05-26T07:00:00Z", description: "Moved to Lagos sorting hub" },
      { status: "Out for Delivery", location: "Victoria Island, Lagos", timestamp: "2026-05-28T09:00:00Z", description: "Courier is on the way to you" },
    ],
  },
  "DHL-777777": {
    trackingNumber: "DHL-777777", carrier: "DHL Express",
    status: "Delivered", statusCode: "delivered", eta: "Delivered", progress: 100,
    events: [
      { status: "Label Created",    location: "Abuja, Nigeria",     timestamp: "2026-05-22T08:00:00Z", description: "Shipment created" },
      { status: "Picked Up",        location: "DHL Abuja Hub",      timestamp: "2026-05-22T12:00:00Z", description: "Courier collected shipment" },
      { status: "In Transit",       location: "Lagos Distribution", timestamp: "2026-05-23T09:00:00Z", description: "Shipment in transit" },
      { status: "Out for Delivery", location: "Lekki, Lagos",       timestamp: "2026-05-24T09:00:00Z", description: "Courier out for delivery" },
      { status: "Delivered",        location: "Customer Address",   timestamp: "2026-05-24T14:45:00Z", description: "Package delivered successfully" },
    ],
  },
};

const AUTO_REFRESH_MS = 60_000;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatTimestamp(ts: string): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("en-NG", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ts; }
}

function progressColor(code: string): string {
  if (code === "delivered")        return "bg-green-500";
  if (code === "out-for-delivery") return "bg-cyan-500";
  return "bg-orange-500";
}

const STAGE_LABELS = [
  "Picked Up", "Departed Origin", "In Transit", "Out for Delivery", "Delivered"
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function TrackerClient() {
  const searchParams = useSearchParams();

  const [input, setInput]             = useState("");
  const [shipment, setShipment]       = useState<ShipmentData | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [isMock, setIsMock]           = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /* Simulation state */
  const [simMode, setSimMode]         = useState(false);
  const [simStage, setSimStage]       = useState(0);
  const [simStages, setSimStages]     = useState<ShipmentData[]>([]);

  const activeTracking = useRef<string>("");

  /* ─────────────────────────────────────────
     CORE TRACK FUNCTION
  ───────────────────────────────────────── */
  const track = useCallback(async (trackingNumber: string, silent = false) => {
    const cleaned = trackingNumber.trim().toUpperCase();
    if (!cleaned) return;

    activeTracking.current = cleaned;

    if (!silent) {
      setLoading(true);
      setError("");
      setShipment(null);
      setIsMock(false);
      setSimMode(false);
    }

    try {
      const res  = await fetch(
        `/api/shipping/dhl/track?trackingNumber=${encodeURIComponent(cleaned)}`,
        { cache: "no-store" },
      );
      const json = await res.json();

      if (json.success) {
        setShipment(json.data);
        setIsMock(false);
        setLastUpdated(new Date());
        return;
      }

      if (json.code === "NOT_FOUND" || res.status === 404) {
        const mock = SANDBOX_MOCKS[cleaned];
        if (mock) { setShipment(mock); setIsMock(true); setLastUpdated(new Date()); return; }
        if (!silent) setError("Tracking number not found. Please check and try again.");
        return;
      }

      if (json.code === "NETWORK_ERROR") {
        const mock = SANDBOX_MOCKS[cleaned];
        if (mock) { setShipment(mock); setIsMock(true); setLastUpdated(new Date()); return; }
      }

      if (!silent) setError(json.message ?? "Could not retrieve tracking information.");
    } catch {
      const mock = SANDBOX_MOCKS[cleaned];
      if (mock) {
        setShipment(mock); setIsMock(true); setLastUpdated(new Date());
      } else if (!silent) {
        setError("Tracking service unavailable. Please try again later.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  /* ── Start simulation mode ── */
  const startSim = useCallback((trackingNumber: string) => {
    const cleaned = (trackingNumber || input).trim().toUpperCase() || "SIM-TEST-001";
    const stages  = buildSimStages(cleaned);
    setSimStages(stages);
    setSimStage(0);
    setShipment(stages[0]);
    setSimMode(true);
    setIsMock(false);
    setError("");
    setLastUpdated(new Date());
    setInput(cleaned);
    activeTracking.current = cleaned;
    setLoading(false);
  }, [input]);

  /* ── Advance simulation stage ── */
  const advanceSimStage = useCallback(() => {
    setSimStage((prev) => {
      const next = Math.min(prev + 1, simStages.length - 1);
      setShipment(simStages[next]);
      setLastUpdated(new Date());
      return next;
    });
  }, [simStages]);

  /* ── Auto-track from URL ?tracking=xxx ── */
  useEffect(() => {
    const t = searchParams.get("tracking");
    if (t) { setInput(t); track(t); }
  }, [searchParams, track]);

  /* ── Auto-refresh every 60s for live shipments ── */
  useEffect(() => {
    if (!shipment || isMock || simMode || shipment.statusCode === "delivered") return;
    const id = setInterval(() => {
      if (activeTracking.current) track(activeTracking.current, true);
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [shipment, isMock, simMode, track]);

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0B1120] text-white px-6 py-12">
        <div className="max-w-5xl mx-auto">

          {/* HERO */}
          <div className="mb-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <Truck className="text-orange-400" size={34} />
            </div>
            <h1 className="text-4xl font-bold">
              Shipment <span className="text-orange-400">Tracker</span>
            </h1>
            <p className="text-white/50 mt-4 max-w-2xl mx-auto">
              Track your DHL shipments in real time — checkpoints, delivery progress, and ETA.
            </p>
          </div>

          {/* SEARCH */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && track(input)}
                  placeholder="Enter DHL tracking number…"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 outline-none focus:border-orange-500/50 text-sm"
                />
              </div>
              <button
                onClick={() => track(input)}
                disabled={loading || !input.trim()}
                className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition font-medium flex items-center justify-center gap-2 min-w-[160px]"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Tracking…</>
                  : <><Navigation size={16} /> Track</>}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 mb-8 flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* SIMULATION CONTROLS */}
          {simMode && shipment && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-purple-300 text-sm">
                  <FlaskConical size={15} />
                  <span className="font-medium">Simulation Mode</span>
                  <span className="text-purple-400/60">·</span>
                  <span className="text-purple-400/80">
                    Stage {simStage + 1} of {simStages.length}: {STAGE_LABELS[simStage]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Stage dots */}
                  <div className="flex gap-1.5 mr-2">
                    {simStages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setSimStage(i); setShipment(simStages[i]); setLastUpdated(new Date()); }}
                        className={`w-2.5 h-2.5 rounded-full transition ${
                          i === simStage ? "bg-purple-400" : i < simStage ? "bg-purple-600" : "bg-white/20"
                        }`}
                        title={STAGE_LABELS[i]}
                      />
                    ))}
                  </div>
                  <button
                    onClick={advanceSimStage}
                    disabled={simStage >= simStages.length - 1}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 disabled:opacity-40 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    Next Stage →
                  </button>
                  <button
                    onClick={() => { setSimMode(false); setShipment(null); setInput(""); }}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white text-xs transition"
                  >
                    Exit
                  </button>
                </div>
              </div>
              {/* Progress bar for stages */}
              <div className="mt-3 flex gap-1">
                {simStages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= simStage ? "bg-purple-400" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!shipment && !error && !loading && (
            <div className="text-center py-24">
              <Package size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/30 mb-6">Enter a tracking number above to get started</p>

              {/* Demo numbers */}
              <div className="flex justify-center gap-3 flex-wrap mb-8">
                {Object.keys(SANDBOX_MOCKS).map((t) => (
                  <button key={t} onClick={() => { setInput(t); track(t); }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-white/60 transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-white/20 text-xs mb-2">Demo numbers above</p>

              {/* Sim mode entry */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-white/20 text-xs">Want to test the full delivery flow?</p>
                <button
                  onClick={() => startSim(input)}
                  className="px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 text-sm flex items-center gap-2 transition"
                >
                  <FlaskConical size={14} /> Run Full Delivery Simulation
                </button>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="flex items-center justify-center py-24 gap-3 text-white/40">
              <Loader2 size={24} className="animate-spin text-orange-400" />
              Fetching shipment data from DHL…
            </div>
          )}

          {/* RESULT */}
          {shipment && !loading && (
            <div className="space-y-6">

              {/* Summary card */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs border ${
                        simMode
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/20"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/20"
                      }`}>
                        {shipment.status}
                      </span>
                      <span className="text-white/30 text-sm">{shipment.carrier}</span>
                      {simMode && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                          <FlaskConical size={10} /> Simulated
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold font-mono">{shipment.trackingNumber}</h2>
                    {shipment.eta && shipment.eta !== "Delivered" && (
                      <p className="text-white/50 mt-3 text-sm">
                        Estimated delivery: <span className="text-white font-medium">{shipment.eta}</span>
                      </p>
                    )}
                    {shipment.statusCode === "delivered" && (
                      <p className="text-green-400 mt-3 text-sm flex items-center gap-1">
                        <CheckCircle2 size={14} /> Package delivered
                      </p>
                    )}
                    {lastUpdated && !isMock && (
                      <p className="text-white/25 text-xs mt-2">
                        Last updated: {lastUpdated.toLocaleTimeString("en-NG")}
                        {!simMode && shipment.statusCode !== "delivered" && " · auto-refreshes every 60s"}
                        {simMode && " · simulation"}
                      </p>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="lg:w-[300px]">
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-white/50">Progress</span>
                      <span className="font-bold">{shipment.progress}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          simMode ? "bg-purple-500" : progressColor(shipment.statusCode)
                        }`}
                        style={{ width: `${shipment.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/20 mt-2">
                      <span>Created</span><span>In Transit</span><span>Delivered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-semibold">Shipment Timeline</h3>
                  <div className="flex items-center gap-2">
                    {simMode && (
                      <button
                        onClick={advanceSimStage}
                        disabled={simStage >= simStages.length - 1}
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40 transition px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20"
                      >
                        <FlaskConical size={12} />
                        {simStage >= simStages.length - 1 ? "Final Stage" : "Next Stage"}
                      </button>
                    )}
                    {!simMode && (
                      <button
                        onClick={() => track(shipment.trackingNumber)}
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                      >
                        <RefreshCw size={12} /> Refresh
                      </button>
                    )}
                  </div>
                </div>

                {shipment.events.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/30 text-sm mb-4">No tracking events yet from DHL.</p>
                    <button
                      onClick={() => startSim(shipment.trackingNumber)}
                      className="px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 text-sm flex items-center gap-2 transition mx-auto"
                    >
                      <FlaskConical size={14} /> Simulate Tracking Updates
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {[...shipment.events].reverse().map((event, i, arr) => {
                      const isLatest = i === 0;
                      return (
                        <div key={i} className="flex gap-5">
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${
                              isLatest
                                ? simMode
                                  ? "bg-purple-500/20 border-purple-500/30"
                                  : "bg-orange-500/20 border-orange-500/30"
                                : "bg-green-500/10 border-green-500/20"
                            }`}>
                              {isLatest
                                ? <CircleDot className={simMode ? "text-purple-400" : "text-orange-400"} size={16} />
                                : <CheckCircle2 className="text-green-400" size={16} />}
                            </div>
                            {i !== arr.length - 1 && (
                              <div className="w-[2px] flex-1 bg-white/10 my-2 min-h-[24px]" />
                            )}
                          </div>

                          <div className="flex-1 pb-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
                              <div>
                                <h4 className={`font-semibold ${
                                  isLatest ? (simMode ? "text-purple-300" : "text-orange-400") : ""
                                }`}>
                                  {event.status}
                                </h4>
                                {event.description && (
                                  <p className="text-white/50 text-sm mt-1">{event.description}</p>
                                )}
                                {event.remark && (
                                  <p className="text-white/30 text-xs mt-1 italic">{event.remark}</p>
                                )}
                              </div>
                              <div className="flex flex-col lg:items-end text-xs gap-1 shrink-0">
                                <span className="flex items-center gap-1 text-white/40">
                                  <MapPin size={11} />{event.location}
                                </span>
                                <span className="flex items-center gap-1 text-white/30">
                                  <Clock size={11} />{formatTimestamp(event.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick info cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Carrier",        value: shipment.carrier },
                  { label: "Current Status", value: shipment.status },
                  { label: "Delivery ETA",   value: shipment.eta || "TBD" },
                ].map((c) => (
                  <div key={c.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    <p className="text-sm text-white/40 mb-2">{c.label}</p>
                    <p className="font-semibold">{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Simulate button if real shipment has no events */}
              {!simMode && !isMock && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => startSim(shipment.trackingNumber)}
                    className="inline-flex items-center gap-2 text-sm text-purple-400/60 hover:text-purple-300 transition"
                  >
                    <FlaskConical size={13} /> Simulate full delivery flow for this AWB
                  </button>
                </div>
              )}

              {/* Track on DHL.com */}
              <div className="text-center">
                <a
                  href={`https://www.dhl.com/ng-en/home/tracking/tracking-express.html?submit=1&tracking-id=${shipment.trackingNumber}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-yellow-400 transition"
                >
                  <ExternalLink size={13} /> Also track on DHL.com
                </a>
              </div>

            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
}
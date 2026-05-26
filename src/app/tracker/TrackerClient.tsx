"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  CircleDot,
  Truck,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

type Status =
  | "Label Created"
  | "Picked Up"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered";

type TrackingEvent = {
  status: Status;
  location: string;
  time: string;
  description: string;
};

type Shipment = {
  trackingNumber: string;
  courier: string;
  status: Status;
  eta: string;
  progress: number;
  events: TrackingEvent[];
};

/* ================= MOCK DHL DATA ================= */

const mockDatabase: Record<string, Shipment> = {
  "DHL-123456": {
    trackingNumber: "DHL-123456",
    courier: "DHL Express",
    status: "In Transit",
    eta: "2–3 Days",
    progress: 60,
    events: [
      {
        status: "Label Created",
        location: "Lagos, Nigeria",
        time: "10:00 AM",
        description: "Shipment created by seller",
      },
      {
        status: "Picked Up",
        location: "DHL Lagos Hub",
        time: "2:30 PM",
        description: "Package collected by courier",
      },
      {
        status: "In Transit",
        location: "International Sorting Center",
        time: "Yesterday",
        description: "Package en route to destination",
      },
    ],
  },

  "DHL-999999": {
    trackingNumber: "DHL-999999",
    courier: "DHL Express",
    status: "Out for Delivery",
    eta: "Today",
    progress: 90,
    events: [
      {
        status: "Label Created",
        location: "Ibadan, Nigeria",
        time: "8:15 AM",
        description: "Order placed successfully",
      },
      {
        status: "Picked Up",
        location: "DHL Ibadan Center",
        time: "11:30 AM",
        description: "Shipment picked up by DHL",
      },
      {
        status: "In Transit",
        location: "DHL Hub Lagos",
        time: "Yesterday",
        description: "Shipment moved to sorting hub",
      },
      {
        status: "Out for Delivery",
        location: "Victoria Island, Lagos",
        time: "Now",
        description: "Courier is delivering your package",
      },
    ],
  },

  "DHL-777777": {
    trackingNumber: "DHL-777777",
    courier: "DHL Express",
    status: "Delivered",
    eta: "Delivered",
    progress: 100,
    events: [
      {
        status: "Label Created",
        location: "Abuja, Nigeria",
        time: "Monday",
        description: "Shipment created",
      },
      {
        status: "Picked Up",
        location: "DHL Abuja Hub",
        time: "Monday",
        description: "Courier collected shipment",
      },
      {
        status: "In Transit",
        location: "Lagos Distribution Center",
        time: "Tuesday",
        description: "Shipment in transit",
      },
      {
        status: "Out for Delivery",
        location: "Lekki, Lagos",
        time: "Wednesday Morning",
        description: "Courier out for delivery",
      },
      {
        status: "Delivered",
        location: "Customer Address",
        time: "Wednesday 2:45 PM",
        description: "Package delivered successfully",
      },
    ],
  },
};

/* ================= PAGE ================= */

export default function TrackerClient() {
  const searchParams = useSearchParams();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState("");

  /* ================= AUTO TRACK FROM URL ================= */
  useEffect(() => {
    const trackingFromParams = searchParams.get("tracking");

    if (trackingFromParams) {
      setTrackingNumber(trackingFromParams);

      const normalized = trackingFromParams
        .trim()
        .toUpperCase();

      const result = mockDatabase[normalized];

      if (result) {
        setShipment(result);
        setError("");
      }
    }
  }, [searchParams]);

  /* ================= HANDLE TRACK ================= */

  const handleTrack = () => {
    const normalizedTracking = trackingNumber
      .trim()
      .toUpperCase();

    const result = mockDatabase[normalizedTracking];

    if (!result) {
      setError("Tracking number not found");
      setShipment(null);
      return;
    }

    setShipment(result);
    setError("");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0B1120] text-white px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* ================= HERO ================= */}

          <div className="mb-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <Truck className="text-orange-400" size={34} />
            </div>

            <h1 className="text-4xl font-bold">
              Shipment <span className="text-orange-400">Tracker</span>
            </h1>

            <p className="text-white/50 mt-4 max-w-2xl mx-auto">
              Track your orders in real time with DHL-powered shipment updates,
              delivery progress, and courier activity.
            </p>
          </div>

          {/* ================= SEARCH ================= */}

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  size={18}
                />

                <input
                  value={trackingNumber}
                  onChange={(e) =>
                    setTrackingNumber(e.target.value)
                  }
                  placeholder="Enter tracking number (e.g. DHL-123456)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={handleTrack}
                className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2"
              >
                Track Shipment
                <Navigation size={16} />
              </button>
            </div>
          </div>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 mb-8 text-center">
              {error}
            </div>
          )}

          {/* ================= EMPTY STATE ================= */}

          {!shipment && !error && (
            <div className="text-center py-24">
              <div className="text-white/30">
                Enter a DHL tracking number to begin tracking
              </div>

              <div className="flex justify-center gap-3 mt-6 flex-wrap">
                <button
                  onClick={() =>
                    setTrackingNumber("DHL-123456")
                  }
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
                >
                  DHL-123456
                </button>

                <button
                  onClick={() =>
                    setTrackingNumber("DHL-999999")
                  }
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
                >
                  DHL-999999
                </button>

                <button
                  onClick={() =>
                    setTrackingNumber("DHL-777777")
                  }
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
                >
                  DHL-777777
                </button>
              </div>
            </div>
          )}

          {/* ================= SHIPMENT RESULT ================= */}

          {shipment && (
            <div className="space-y-8">
              {/* SUMMARY CARD */}

              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  {/* LEFT */}

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/20">
                        {shipment.status}
                      </span>

                      <span className="text-white/30 text-sm">
                        {shipment.courier}
                      </span>
                    </div>

                    <h2 className="text-3xl font-bold">
                      {shipment.trackingNumber}
                    </h2>

                    <p className="text-white/50 mt-3">
                      Estimated delivery:{" "}
                      <span className="text-white">
                        {shipment.eta}
                      </span>
                    </p>
                  </div>

                  {/* RIGHT */}

                  <div className="lg:w-[320px]">
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-white/50">
                        Shipment Progress
                      </span>

                      <span className="font-medium">
                        {shipment.progress}%
                      </span>
                    </div>

                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${shipment.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE */}

              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-8">
                  Shipment Timeline
                </h3>

                <div className="space-y-8">
                  {shipment.events.map((event, i) => (
                    <div
                      key={i}
                      className="flex gap-5"
                    >
                      {/* ICON COLUMN */}

                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            i === shipment.events.length - 1
                              ? "bg-orange-500/20 border border-orange-500/20"
                              : "bg-green-500/10 border border-green-500/20"
                          }`}
                        >
                          {i === shipment.events.length - 1 ? (
                            <CircleDot
                              className="text-orange-400"
                              size={18}
                            />
                          ) : (
                            <CheckCircle2
                              className="text-green-400"
                              size={18}
                            />
                          )}
                        </div>

                        {i !== shipment.events.length - 1 && (
                          <div className="w-[2px] flex-1 bg-white/10 my-2" />
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 pb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {event.status}
                            </h4>

                            <p className="text-white/50 mt-1">
                              {event.description}
                            </p>
                          </div>

                          <div className="flex flex-col lg:items-end text-sm">
                            <span className="flex items-center gap-1 text-white/40">
                              <MapPin size={13} />
                              {event.location}
                            </span>

                            <span className="flex items-center gap-1 text-white/30 mt-1">
                              <Clock size={13} />
                              {event.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ACTIONS */}

              <div className="grid md:grid-cols-3 gap-4">
                <QuickCard
                  title="Courier"
                  value={shipment.courier}
                />

                <QuickCard
                  title="Current Status"
                  value={shipment.status}
                />

                <QuickCard
                  title="Delivery ETA"
                  value={shipment.eta}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function QuickCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
      <p className="text-sm text-white/40">{title}</p>

      <p className="font-semibold mt-2">{value}</p>
    </div>
  );
}
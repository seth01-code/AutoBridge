import { NextRequest, NextResponse } from "next/server";

/* ─────────────────────────────────────────────
   GET /api/shipping/dhl/track?trackingNumber=xxx

   Uses the MyDHL API tracking endpoint with
   Basic Auth (API Key + Secret) — same credentials
   as shipment creation / rates.

   DHL Express Tracking docs:
   https://developer.dhl.com/api-reference/dhl-express-mydhl-api#operations-Tracking-get_shipments__shipmentTrackingNumber__tracking
───────────────────────────────────────────── */

const DHL_TRACK_URL = "https://express.api.dhl.com/mydhlapi/test/shipments";

/* ── DHL 2-letter checkpoint codes → human-readable description ──
   Source: DHL Checkpoint Codes reference sheet
── */
const CHECKPOINT_DESCRIPTIONS: Record<string, string> = {
  ad: "Agreed delivery",
  af: "Arrived at facility",
  ar: "Arrival in delivery facility",
  ba: "Bad address",
  bn: "Customer broker notified",
  br: "Broker release",
  ca: "Closed on arrival",
  cc: "Awaiting consignee collection",
  cd: "Controllable clearance delay",
  cm: "Customer moved",
  cr: "Clearance release",
  cs: "Closed shipment",
  dd: "Delivered damaged",
  df: "Departed facility",
  ds: "Destroyed / disposal",
  fd: "Forward destination",
  hp: "Held for payment",
  ic: "In clearance processing",
  mc: "Mis-code",
  md: "Missed delivery cycle",
  ms: "Mis-sort",
  nd: "Not delivered",
  nh: "Not home",
  oh: "On hold",
  ok: "Delivered",
  pd: "Partial delivery",
  pl: "Processed at location",
  pu: "Shipment picked up",
  rd: "Refused delivery",
  rr: "Response received",
  rt: "Returned to consignor",
  sa: "Shipment acceptance",
  sc: "Service changed",
  ss: "Shipment stopped",
  tp: "Forwarded to 3rd party",
  tr: "Record of transfer",
  ud: "Uncontrollable clearance delay",
  wc: "With delivering courier",
};

/* ── DHL 2-letter checkpoint codes → 0-100 progress value ──
   Grouped by logical stage in the shipment lifecycle.
── */
const CHECKPOINT_PROGRESS: Record<string, number> = {
  // Pickup & acceptance
  pu: 10, // Shipment picked up
  sa: 15, // Shipment acceptance

  // In transit / processing
  pl: 25, // Processed at location
  tr: 30, // Record of transfer
  df: 35, // Departed facility
  af: 40, // Arrived at facility
  sc: 40, // Service changed
  ms: 40, // Mis-sort (still moving)

  // Clearance
  ic: 50, // In clearance processing
  bn: 55, // Customer broker notified
  ud: 55, // Uncontrollable clearance delay
  cd: 55, // Controllable clearance delay
  cr: 65, // Clearance release
  br: 65, // Broker release

  // Out for delivery / arrival at delivery facility
  ar: 70, // Arrival in delivery facility
  fd: 75, // Forward destination
  tp: 75, // Forwarded to 3rd party
  wc: 85, // With delivering courier
  ad: 90, // Agreed delivery
  cc: 88, // Awaiting consignee collection

  // Delivered states
  ok: 100, // Delivered
  pd: 95, // Partial delivery
  dd: 95, // Delivered damaged

  // Exception / hold states — shipment is somewhere, just stalled
  nh: 80, // Not home (attempted delivery)
  nd: 80, // Not delivered (attempted delivery)
  md: 78, // Missed delivery cycle
  oh: 50, // On hold
  hp: 50, // Held for payment
  ss: 50, // Shipment stopped
  ba: 45, // Bad address
  cm: 45, // Customer moved
  ca: 40, // Closed on arrival
  mc: 40, // Mis-code
  rr: 50, // Response received

  // Terminal negative states
  rd: 90, // Refused delivery
  rt: 20, // Returned to consignor
  ds: 10, // Destroyed / disposal
  cs: 10, // Closed shipment
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get("trackingNumber");

  if (!trackingNumber) {
    return NextResponse.json(
      { success: false, message: "trackingNumber query param required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.DHL_API_KEY ?? "";
  const apiSecret = process.env.DHL_API_SECRET ?? "";

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "DHL_API_KEY or DHL_API_SECRET not configured",
      },
      { status: 500 },
    );
  }

  // Basic Auth: base64(apiKey:apiSecret)
  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  // MyDHL API tracking endpoint
  const url = `${DHL_TRACK_URL}/${encodeURIComponent(trackingNumber.trim())}/tracking`;

  console.log(`[DHL TRACK] Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
        "Message-Reference": `track-${Date.now()}`,
        "Message-Reference-Date": new Date().toUTCString(),
      },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    const data = await response.json();
    console.log(
      `[DHL TRACK] HTTP ${response.status}:`,
      JSON.stringify(data, null, 2),
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            message: "Tracking number not found in DHL system",
            code: "NOT_FOUND",
          },
          { status: 404 },
        );
      }
      if (response.status === 401) {
        console.error(
          "[DHL TRACK] 401 Unauthorized — check DHL_API_KEY and DHL_API_SECRET in .env.local",
        );
        return NextResponse.json(
          {
            success: false,
            message: "DHL API authentication failed — check server credentials",
            code: "AUTH_ERROR",
          },
          { status: 502 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: data?.title ?? data?.detail ?? "DHL tracking error",
        },
        { status: 502 },
      );
    }

    /* ── Normalise MyDHL tracking response → our TrackingData shape ──
       MyDHL returns: { shipments: [{ shipmentTrackingNumber, status, events, ... }] }
    ── */
    const shipments: any[] = data.shipments ?? [];

    if (!shipments.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No shipment data returned by DHL",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    const shipment = shipments[0];
    const events: any[] = shipment.events ?? [];

    // MyDHL statusCode is a 2-letter DHL checkpoint code (e.g. "WC", "OK", "PL")
    const rawStatusCode = (shipment.status?.statusCode ?? "").toLowerCase();

    // Resolve human-readable status: prefer the API's own description,
    // fall back to our checkpoint lookup, then a safe generic default
    const status: string =
      shipment.status?.description ??
      CHECKPOINT_DESCRIPTIONS[rawStatusCode] ??
      "In Transit";

    const eta: string = shipment.estimatedTimeOfDelivery ?? "";

    /* ── Map DHL event → our shape ── */
    const normalisedEvents = events.map((e: any) => {
      const eventCode = (e.typeCode ?? "").toLowerCase();
      return {
        status: e.description ?? CHECKPOINT_DESCRIPTIONS[eventCode] ?? "Update",
        location:
          [
            e.location?.address?.addressLocality,
            e.location?.address?.countryCode,
          ]
            .filter(Boolean)
            .join(", ") || "In transit",
        timestamp: e.timestamp ?? "",
        description: e.description ?? "",
        remark: e.remark ?? "",
      };
    });

    /* ── Derive 0-100 progress from the DHL checkpoint code ── */
    const progress = CHECKPOINT_PROGRESS[rawStatusCode] ?? 30;

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber: trackingNumber.trim(),
        carrier: "DHL Express",
        status,
        statusCode: rawStatusCode,
        eta,
        progress,
        events: normalisedEvents,
      },
    });
  } catch (err: any) {
    const isTimeout =
      err?.name === "TimeoutError" || err?.name === "AbortError";
    console.error("[DHL TRACK] fetch error:", err.message);
    return NextResponse.json(
      {
        success: false,
        message: isTimeout
          ? "DHL tracking service timed out. Please try again."
          : "Could not reach DHL tracking service",
        code: "NETWORK_ERROR",
      },
      { status: 503 },
    );
  }
}

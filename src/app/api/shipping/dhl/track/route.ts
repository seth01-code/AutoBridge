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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get("trackingNumber");

  if (!trackingNumber) {
    return NextResponse.json(
      { success: false, message: "trackingNumber query param required" },
      { status: 400 },
    );
  }

  const apiKey    = process.env.DHL_API_KEY ?? "";
  const apiSecret = process.env.DHL_API_SECRET ?? "";

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { success: false, message: "DHL_API_KEY or DHL_API_SECRET not configured" },
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
        Accept:        "application/json",
        "Message-Reference": `autobridge-track-${Date.now()}`,
        "Message-Reference-Date": new Date().toUTCString(),
      },
      signal: AbortSignal.timeout(10_000),
      cache:  "no-store",
    });

    const data = await response.json();
    console.log(`[DHL TRACK] HTTP ${response.status}:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: "Tracking number not found in DHL system", code: "NOT_FOUND" },
          { status: 404 },
        );
      }
      if (response.status === 401) {
        console.error("[DHL TRACK] 401 Unauthorized — check DHL_API_KEY and DHL_API_SECRET in .env.local");
        return NextResponse.json(
          { success: false, message: "DHL API authentication failed — check server credentials", code: "AUTH_ERROR" },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { success: false, message: data?.title ?? data?.detail ?? "DHL tracking error" },
        { status: 502 },
      );
    }

    /* ── Normalise MyDHL tracking response → our TrackingData shape ──
       MyDHL returns: { shipments: [{ shipmentTrackingNumber, status, events, ... }] }
    ── */
    const shipments: any[] = data.shipments ?? [];

    if (!shipments.length) {
      return NextResponse.json(
        { success: false, message: "No shipment data returned by DHL", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const shipment = shipments[0];
    const events: any[] = shipment.events ?? [];

    // MyDHL status lives at shipment.status.description / shipment.status.statusCode
    const status: string    = shipment.status?.description ?? "Unknown";
    const rawStatusCode     = (shipment.status?.statusCode ?? "unknown").toLowerCase();
    const eta: string       = shipment.estimatedTimeOfDelivery
      ?? shipment.estimatedDeliveryDate
      ?? "";

    /* ── Map DHL event → our shape ── */
    const normalisedEvents = events.map((e: any) => ({
      status:      e.description ?? e.status ?? "Update",
      location:    [
        e.location?.address?.addressLocality,
        e.location?.address?.countryCode,
      ].filter(Boolean).join(", ") || "In transit",
      timestamp:   e.timestamp ?? "",
      description: e.description ?? "",
      remark:      e.remark ?? "",
    }));

    /* ── Derive 0-100 progress from status code ── */
    const progressMap: Record<string, number> = {
      "pre-transit":      10,
      "transit":          50,
      "out-for-delivery": 85,
      "delivered":       100,
      "failure":          40,
      "unknown":          20,
    };
    const progress = progressMap[rawStatusCode] ?? 30;

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber: trackingNumber.trim(),
        carrier:    "DHL Express",
        status,
        statusCode: rawStatusCode,
        eta,
        progress,
        events: normalisedEvents,
      },
    });

  } catch (err: any) {
    const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
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
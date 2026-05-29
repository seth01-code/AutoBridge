import { NextRequest, NextResponse } from "next/server";

/* ─────────────────────────────────────────────
   POST /api/shipping/dhl/shipment
   Creates a DHL Express shipment via MyDHL API v2.
   Returns { success, trackingNumber, labelUrl }.
───────────────────────────────────────────── */

const USE_PRODUCTION = process.env.DHL_USE_PRODUCTION === "true";

const DHL_SHIPMENT_URL = USE_PRODUCTION
  ? "https://express.api.dhl.com/mydhlapi/shipments"
  : "https://express.api.dhl.com/mydhlapi/test/shipments";

const SHIPPER = {
  fullName:     "AutoBridge Marketplace",
  phone:        "+2341234567890",
  email:        "dispatch@autobridge.ng",
  addressLine1: "1 Broad Street",
  cityName:     "Lagos",
  postalCode:   "101001", // FIX 1: real Lagos GPO postal code (was "100001")
  countryCode:  "NG",
};

const COUNTRY_TO_ISO: Record<string, string> = {
  Nigeria:          "NG",
  Ghana:            "GH",
  Kenya:            "KE",
  "South Africa":   "ZA",
  "United Kingdom": "GB",
  "United States":  "US",
  Canada:           "CA",
  Germany:          "DE",
  France:           "FR",
  UAE:              "AE",
};

/* ── FIX 2: sensible postal-code fallbacks per country ── */
const COUNTRY_POSTAL_FALLBACK: Record<string, string> = {
  NG: "101001", // Lagos GPO
  GH: "00233",
  KE: "00100",
  ZA: "0001",
  GB: "W1A 1AA",
  US: "10001",
  CA: "M5H 2N2",
  DE: "10115",
  FR: "75001",
  AE: "00000",
};

function fallbackPostal(countryCode: string, provided?: string): string {
  if (provided && provided.trim() && provided !== "00000") return provided.trim();
  return COUNTRY_POSTAL_FALLBACK[countryCode] ?? "00000";
}

export async function POST(req: NextRequest) {
  const reqId = `SHIP-${Date.now()}`;

  try {
    const body = await req.json();
    const {
      orderId,
      recipientName,
      recipientPhone,
      recipientEmail,
      addressLine1,
      city,
      postalCode,
      countryCode: rawCountry,
      totalWeightKg    = 1,
      declaredValueUSD = 50,
      items            = [],
    } = body;

    if (!orderId || !recipientName || !city || !rawCountry) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const rawKey        = process.env.DHL_API_KEY        ?? "";
    const rawSecret     = process.env.DHL_API_SECRET     ?? "";
    const accountNumber = process.env.DHL_ACCOUNT_NUMBER ?? "";

    if (!rawKey || !rawSecret || !accountNumber) {
      return NextResponse.json(
        { success: false, message: "DHL credentials not configured" },
        { status: 500 },
      );
    }

    const BASIC_AUTH  = Buffer.from(`${rawKey}:${rawSecret}`).toString("base64");
    const destCountry = COUNTRY_TO_ISO[rawCountry] ?? rawCountry;
    const isDomestic  = destCountry === "NG";
    const weightKg    = Math.max(Number(totalWeightKg) || 1, 0.1);

    /* ── Ship date: next weekday ── */
    const shipDate = new Date();
    shipDate.setDate(shipDate.getDate() + 1);
    while (shipDate.getDay() === 0 || shipDate.getDay() === 6)
      shipDate.setDate(shipDate.getDate() + 1);

    // FIX 3: use +00:00 instead of "GMT+00:00" — strict ISO 8601, no space
    const plannedDate = shipDate.toISOString().split("T")[0] + "T10:00:00+00:00";

    /* ── content.description must be ≤ 70 chars ── */
    const fullDesc = items.map((i: any) => i.description).join(", ") || "Marketplace goods";
    const contentDescription = fullDesc.length > 70 ? fullDesc.slice(0, 67) + "..." : fullDesc;

    /* ── Weight distributed evenly across line items ── */
    const perItemWeightKg = Math.max(
      Math.round((weightKg / Math.max(items.length, 1)) * 1000) / 1000,
      0.1,
    );

    /* ── Invoice date ── */
    const invoiceDate = new Date().toISOString().split("T")[0];

    // FIX 4: valid HS commodity code — 8708.99 (auto parts/accessories, other)
    // Change this to the most appropriate code for your product category
    const HS_CODE = "8708.99";

    const payload: any = {
      plannedShippingDateAndTime: plannedDate,

      pickup: { isRequested: false },

      productCode: "P",

      // FIX 5: typeCode must be "account", not "shipper"
      accounts: [{ typeCode: "account", number: accountNumber }],

      customerDetails: {
        shipperDetails: {
          postalAddress: {
            addressLine1: SHIPPER.addressLine1,
            cityName:     SHIPPER.cityName,
            postalCode:   SHIPPER.postalCode,
            countryCode:  SHIPPER.countryCode,
          },
          contactInformation: {
            fullName:    SHIPPER.fullName,
            phone:       SHIPPER.phone,
            email:       SHIPPER.email,
            companyName: SHIPPER.fullName,
          },
          typeCode: "business",
        },

        receiverDetails: {
          postalAddress: {
            addressLine1: addressLine1 || "1 Main Street",
            cityName:     city,
            // FIX 1 (receiver): use real fallback, never "00000"
            postalCode:   fallbackPostal(destCountry, postalCode),
            countryCode:  destCountry,
          },
          contactInformation: {
            fullName:    recipientName,
            phone:       recipientPhone || "+23400000000",
            email:       recipientEmail || "",
            companyName: recipientName,
          },
          typeCode: "private",
        },
      },

      content: {
        packages: [
          {
            weight:     weightKg,
            dimensions: { length: 25, width: 20, height: 15 },
          },
        ],

        isCustomsDeclarable:   !isDomestic,
        declaredValue:         declaredValueUSD,
        declaredValueCurrency: "USD",
        description:           contentDescription,
        incoterm:              "DAP",
        unitOfMeasurement:     "metric",

        ...(
          !isDomestic && {
            exportDeclaration: {
              lineItems: items.length
                ? items.map((item: any, idx: number) => ({
                    number:      idx + 1,
                    description: (item.description ?? "Goods").slice(0, 70),
                    price:       Math.max(
                      Math.round(declaredValueUSD / Math.max(items.length, 1)),
                      1,
                    ),
                    quantity: {
                      value:             item.quantity ?? 1,
                      unitOfMeasurement: "PCS",
                    },
                    weight: {
                      netValue:   perItemWeightKg,
                      grossValue: perItemWeightKg,
                    },
                    // FIX 4: valid HS code (was "9999.99" which DHL rejects)
                    commodityCodes: [
                      { typeCode: "outbound", value: HS_CODE },
                    ],
                    exportReasonType:    "permanent",
                    manufacturerCountry: "NG",
                    isTaxesPaid:         false,
                  }))
                : [
                    {
                      number:      1,
                      description: "Marketplace goods",
                      price:       declaredValueUSD,
                      quantity:    { value: 1, unitOfMeasurement: "PCS" },
                      weight:      { netValue: weightKg, grossValue: weightKg },
                      commodityCodes: [
                        { typeCode: "outbound", value: HS_CODE },
                      ],
                      exportReasonType:    "permanent",
                      manufacturerCountry: "NG",
                      isTaxesPaid:         false,
                    },
                  ],
              invoice: {
                date:   invoiceDate,
                number: `AB-${reqId}`,
              },
            },
          }
        ),
      },

      outputImageProperties: {
        printerDPI:     300,
        encodingFormat: "pdf",
        imageOptions: [
          { typeCode: "label",      templateName: "ECOM26_84_001",   isRequested: true },
          { typeCode: "waybillDoc", templateName: "ARCH_8X4_A4_001", isRequested: true },
        ],
      },
    };

    console.log(`\n[${reqId}] Creating DHL shipment → ${DHL_SHIPMENT_URL}`);
    console.log(`[${reqId}] Payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch(DHL_SHIPMENT_URL, {
      method:  "POST",
      headers: {
        "Content-Type":           "application/json",
        Authorization:            `Basic ${BASIC_AUTH}`,
        "Message-Reference":      reqId,
        "Message-Reference-Date": new Date().toUTCString(),
        Accept:                   "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`[${reqId}] DHL response (${response.status}):`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      const details: string[] = data?.additionalDetails ?? [];
      const reason = details.length
        ? details.join(" | ")
        : data?.detail ?? data?.title ?? "DHL shipment creation failed";

      // Surface full DHL error in non-production for easier debugging
      const extra = USE_PRODUCTION ? {} : { _dhlRaw: data };
      return NextResponse.json({ success: false, message: reason, ...extra }, { status: 502 });
    }

    /* ── Extract tracking number ── */
    const trackingNumber: string =
      data.shipmentTrackingNumber ??
      data.packages?.[0]?.trackingNumber ??
      "";

    /* ── Extract shipping label (base64 PDF) ── */
    const labelDoc  = (data.documents ?? []).find((d: any) => d.typeCode === "label");
    const labelBase64: string = labelDoc?.content ?? "";
    const labelUrl  = labelBase64 ? `data:application/pdf;base64,${labelBase64}` : "";

    return NextResponse.json({ success: true, trackingNumber, labelUrl });

  } catch (err: any) {
    console.error(`[${reqId}] DHL shipment error:`, err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
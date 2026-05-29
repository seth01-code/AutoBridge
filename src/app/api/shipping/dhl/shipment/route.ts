import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// Environment
// ─────────────────────────────────────────────────────────────
const USE_PRODUCTION = process.env.DHL_USE_PRODUCTION === "true";

const DHL_SHIPMENT_URL = USE_PRODUCTION
  ? "https://express.api.dhl.com/mydhlapi/shipments"
  : "https://express.api.dhl.com/mydhlapi/test/shipments";

// ─────────────────────────────────────────────────────────────
// Fixed shipper (always the NG origin)
// ─────────────────────────────────────────────────────────────
const SHIPPER = {
  fullName:     "AutoBridge Marketplace",
  phone:        "+2341234567890",
  email:        "dispatch@autobridge.ng",
  addressLine1: "1 Broad Street",
  cityName:     "Lagos",
  postalCode:   "101001",
  countryCode:  "NG",
};

// ─────────────────────────────────────────────────────────────
// Country helpers
// ─────────────────────────────────────────────────────────────
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

const POSTAL_FALLBACK: Record<string, string> = {
  NG: "101001",
  GH: "00233",
  KE: "00100",
  ZA: "0001",
  GB: "W1A1AA",
  US: "10001",
  CA: "M5H2N2",
  DE: "10115",
  FR: "75001",
  AE: "00000",
};

function safePostal(countryCode: string, provided?: string): string {
  if (provided && provided.trim() && provided !== "00000") return provided.trim();
  return POSTAL_FALLBACK[countryCode] ?? "00000";
}

// ─────────────────────────────────────────────────────────────
// Next business day (skip weekends), formatted for Nigeria GMT+1
// ─────────────────────────────────────────────────────────────
function nextBusinessDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  // YYYY-MM-DD — Nigeria is GMT+1
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T10:00:00 GMT+01:00`;
}

// ─────────────────────────────────────────────────────────────
// Image-option templates (exact names from the DHL JSON collection)
//
//  Domestic (2 templates):
//    label      → ECOM26_84_A4_001
//    waybillDoc → ARCH_8X4_A4_002  (hideAccountNumber: true)
//
//  International (3 templates, same label + waybill PLUS):
//    invoice    → COMMERCIAL_INVOICE_P_10  (invoiceType: "commercial")
// ─────────────────────────────────────────────────────────────
const DOMESTIC_IMAGE_OPTIONS = [
  {
    templateName: "ECOM26_84_A4_001",
    typeCode:     "label",
  },
  {
    templateName:        "ARCH_8X4_A4_002",
    typeCode:            "waybillDoc",
    isRequested:         true,
    hideAccountNumber:   true,
  },
];

const INTERNATIONAL_IMAGE_OPTIONS = [
  ...DOMESTIC_IMAGE_OPTIONS,
  {
    templateName:  "COMMERCIAL_INVOICE_P_10",
    typeCode:      "invoice",
    invoiceType:   "commercial",
    languageCode:  "eng",
    isRequested:   true,
  },
];

// HS code — no dots; DHL expects a plain numeric string
const HS_CODE = "870899";

// ─────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const reqId = `SHIP-${Date.now()}`;

  try {
    const body = await req.json();
    console.log(`[${reqId}] Body:`, JSON.stringify(body));

    const {
      orderId,
      recipientName,
      recipientPhone,
      recipientEmail,
      addressLine1,
      city,
      postalCode,
      countryCode:    rawCountry,
      dhlProductCode  = "P",   // "N" domestic | "D" intl-doc | "P" intl-package
      totalWeightKg   = 1,
      declaredValueUSD = 50,
      items           = [],
    } = body;

    // ── Validation ──────────────────────────────────────────
    if (!orderId || !recipientName || !city || !rawCountry) {
      const missing = [
        !orderId       && "orderId",
        !recipientName && "recipientName",
        !city          && "city",
        !rawCountry    && "countryCode",
      ].filter(Boolean).join(", ");
      console.error(`[${reqId}] Missing: ${missing}`);
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missing}` },
        { status: 400 },
      );
    }

    // ── Credentials ─────────────────────────────────────────
    const rawKey           = process.env.DHL_API_KEY            ?? "";
    const rawSecret        = process.env.DHL_API_SECRET         ?? "";
    // EXP account  — used for NG-outbound & domestic NG shipments
    const exportAccount    = process.env.DHL_EXPORT_ACCOUNT ?? "";
    // IMP account  — used for inbound-to-NG & domestic non-NG shipments
    const importAccount    = process.env.DHL_IMPORT_ACCOUNT ?? exportAccount;

    console.log(`[${reqId}] key="${rawKey.slice(0, 4)}…" exportAcct="${exportAccount}"`);

    if (!rawKey || !rawSecret || !exportAccount) {
      return NextResponse.json(
        { success: false, message: "DHL credentials not configured" },
        { status: 500 },
      );
    }

    const BASIC_AUTH = Buffer.from(`${rawKey}:${rawSecret}`).toString("base64");

    // ── Shipment classification ──────────────────────────────
    const destCountry = COUNTRY_TO_ISO[rawCountry] ?? rawCountry;
    const isDomestic  = destCountry === "NG";

    //  Account selection per the integration matrix:
    //    Within NG            → EXP account
    //    NG → another country → EXP account
    //    Another country → NG → IMP account
    //    Within another country (non-NG domestic) → IMP account
    //    Country 1 → Country 2 (neither NG)       → IMP account
    //
    //  Since this service always ships FROM the NG shipper, only the
    //  first two cases apply:  isDomestic = EXP, else = EXP (NG→world).
    //  If you later support inbound orders (world→NG), swap to IMP.
    const accountNumber = isDomestic ? exportAccount : exportAccount;
    // ^ Both cases use EXP here because the shipper is always NG.
    //   Change to importAccount for world→NG flows.

    const weightKg       = Math.max(Number(totalWeightKg) || 1, 0.1);
    const plannedDate    = nextBusinessDateString();
    const invoiceDate    = new Date().toISOString().split("T")[0];

    const fullDesc = items.map((i: any) => i.description).join(", ") || "Marketplace goods";
    const contentDescription = fullDesc.length > 70
      ? fullDesc.slice(0, 67) + "..."
      : fullDesc;

    const perItemWeightKg = Math.max(
      Math.round((weightKg / Math.max(items.length, 1)) * 1000) / 1000,
      0.1,
    );

    // ── Build export-declaration line items ─────────────────
    //  Each item must have priceCurrency.
    //  Description must be detailed ("Pair of black leather shoes…"), not just "Shoes".
    const lineItems = items.length
      ? items.map((item: any, idx: number) => ({
          number:      idx + 1,
          description: (item.description ?? "Marketplace goods").slice(0, 70),
          price:       Math.max(
            Math.round(declaredValueUSD / Math.max(items.length, 1)),
            1,
          ),
          priceCurrency:       "USD",
          quantity:            { value: item.quantity ?? 1, unitOfMeasurement: "PCS" },
          weight:              { netValue: perItemWeightKg, grossValue: perItemWeightKg },
          commodityCodes:      [{ typeCode: "outbound", value: HS_CODE }],
          exportReasonType:    "permanent",
          manufacturerCountry: "NG",
          isTaxesPaid:         false,
        }))
      : [{
          number:              1,
          description:         "Marketplace goods",
          price:               declaredValueUSD,
          priceCurrency:       "USD",
          quantity:            { value: 1, unitOfMeasurement: "PCS" },
          weight:              { netValue: weightKg, grossValue: weightKg },
          commodityCodes:      [{ typeCode: "outbound", value: HS_CODE }],
          exportReasonType:    "permanent",
          manufacturerCountry: "NG",
          isTaxesPaid:         false,
        }];

    // ── Payload ──────────────────────────────────────────────
    const payload: any = {
      plannedShippingDateAndTime: plannedDate,
      productCode: dhlProductCode,

      pickup: { isRequested: false }, // always false — use the Pickup API separately

      accounts: [{ typeCode: "shipper", number: accountNumber }],

      // allDocumentsInOneImage required by DHL collection
      outputImageProperties: {
        allDocumentsInOneImage: true,
        printerDPI:             300,
        encodingFormat:         "pdf",
        imageOptions: isDomestic
          ? DOMESTIC_IMAGE_OPTIONS        // 2 templates for domestic
          : INTERNATIONAL_IMAGE_OPTIONS,  // 3 templates for international
      },

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
            postalCode:   safePostal(destCountry, postalCode),
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
          { weight: weightKg, dimensions: { length: 25, width: 20, height: 15 } },
        ],
        isCustomsDeclarable:   !isDomestic,
        declaredValue:         declaredValueUSD,
        declaredValueCurrency: "USD",
        description:           contentDescription,
        incoterm:              "DAP",
        unitOfMeasurement:     "metric",

        // exportDeclaration only for international non-document packages
        ...(!isDomestic && dhlProductCode === "P" && {
          exportDeclaration: {
            lineItems,
            invoice: {
              date:   invoiceDate,
              number: `AB-${reqId}`,
            },
          },
        }),
      },
    };

    console.log(`[${reqId}] → ${DHL_SHIPMENT_URL}`);
    console.log(`[${reqId}] Payload:`, JSON.stringify(payload, null, 2));

    // ── Call DHL ─────────────────────────────────────────────
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
    console.log(`[${reqId}] DHL ${response.status}:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      const details: string[] = data?.additionalDetails ?? [];
      const reason = details.length
        ? details.join(" | ")
        : data?.detail ?? data?.title ?? "DHL shipment creation failed";
      return NextResponse.json(
        { success: false, message: reason, _dhlRaw: data },
        { status: 502 },
      );
    }

    // ── Parse response ────────────────────────────────────────
    const trackingNumber: string =
      data.shipmentTrackingNumber ??
      data.packages?.[0]?.trackingNumber ??
      "";

    // DHL returns multiple documents; grab them all by type
    const documents: Array<{ typeCode: string; content: string }> = data.documents ?? [];

    const findDoc = (typeCode: string) =>
      documents.find((d) => d.typeCode === typeCode)?.content ?? "";

    const labelBase64   = findDoc("label");
    const waybillBase64 = findDoc("waybillDoc");
    const invoiceBase64 = findDoc("invoice");

    const toDataUrl = (b64: string) =>
      b64 ? `data:application/pdf;base64,${b64}` : "";

    return NextResponse.json({
      success:        true,
      trackingNumber,
      labelUrl:       toDataUrl(labelBase64),
      waybillUrl:     toDataUrl(waybillBase64),
      invoiceUrl:     toDataUrl(invoiceBase64),   // empty string for domestic
    });

  } catch (err: any) {
    console.error(`[${reqId}] error:`, err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
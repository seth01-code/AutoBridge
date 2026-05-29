import { NextResponse } from "next/server";

// ── Toggle between test and production ──────────────────────────────────────
const USE_PRODUCTION = process.env.DHL_USE_PRODUCTION === "true";

const DHL_API_URL = USE_PRODUCTION
  ? "https://express.api.dhl.com/mydhlapi/rates"
  : "https://express.api.dhl.com/mydhlapi/test/rates";

// ── Startup env validation ───────────────────────────────────────────────────
console.log("\n🔧 [DHL ROUTE] ENV CHECK ON LOAD:");
console.log(`   DHL_API_KEY       : ${process.env.DHL_API_KEY       ? process.env.DHL_API_KEY.slice(0, 4) + "…"       : "❌ NOT SET"}`);
console.log(`   DHL_API_SECRET    : ${process.env.DHL_API_SECRET    ? process.env.DHL_API_SECRET.slice(0, 4) + "…"    : "❌ NOT SET"}`);
console.log(`   DHL_ACCOUNT_NUMBER: ${process.env.DHL_ACCOUNT_NUMBER || "❌ NOT SET"}`);
console.log(`   DHL_USE_PRODUCTION: ${process.env.DHL_USE_PRODUCTION ?? "unset (→ TEST mode)"}`);
console.log(`   Resolved API URL  : ${DHL_API_URL}\n`);

// ── Shipper origin ────────────────────────────────────────────────────────────
const SHIPPER = {
  postalCode:   "101001", // FIX 1: valid Lagos GPO postal code
  cityName:     "Lagos",
  countryCode:  "NG",
  addressLine1: "1 Broad Street",
};

// ── Country name → ISO-3166-1 alpha-2 ────────────────────────────────────────
const COUNTRY_CODE_MAP: Record<string, string> = {
  "Nigeria":        "NG",
  "Ghana":          "GH",
  "Kenya":          "KE",
  "South Africa":   "ZA",
  "United Kingdom": "GB",
  "United States":  "US",
  "Canada":         "CA",
  "Germany":        "DE",
  "France":         "FR",
  "UAE":            "AE",
};

// ── Representative receiver addresses ────────────────────────────────────────
// FIX 2: corrected postal codes — "900001" and "00000" are invalid
const RECEIVER_POSTAL_CODES: Record<string, { postalCode: string; cityName: string; countryCode: string }> = {
  "NG": { postalCode: "101001",  cityName: "Lagos",        countryCode: "NG" }, // Lagos GPO (not Abuja "900001")
  "GB": { postalCode: "EC1A1BB", cityName: "London",       countryCode: "GB" },
  "US": { postalCode: "10001",   cityName: "New York",     countryCode: "US" },
  "CA": { postalCode: "M5H2N2",  cityName: "Toronto",      countryCode: "CA" },
  "DE": { postalCode: "10115",   cityName: "Berlin",       countryCode: "DE" },
  "FR": { postalCode: "75001",   cityName: "Paris",        countryCode: "FR" },
  "GH": { postalCode: "00233",   cityName: "Accra",        countryCode: "GH" },
  "KE": { postalCode: "00100",   cityName: "Nairobi",      countryCode: "KE" },
  "ZA": { postalCode: "2000",    cityName: "Johannesburg", countryCode: "ZA" },
  "AE": { postalCode: "00000",   cityName: "Dubai",        countryCode: "AE" }, // UAE has no postal system; DHL accepts 00000 here only
};

// ── Static fallback rates (used when DHL API is unavailable) ─────────────────
const FALLBACK_RATES: Record<string, Array<{ productCode: string; productName: string; price: number }>> = {
  "NG": [
    { productCode: "N", productName: "DHL Express Domestic", price: 4500  },
    { productCode: "1", productName: "DHL Express Easy",     price: 6500  },
  ],
  "INTL": [
    { productCode: "P", productName: "DHL Express",          price: 95000 },
    { productCode: "N", productName: "DHL Economy Select",   price: 65000 },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN HANDLER
═══════════════════════════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  const reqId = `DHL-${Date.now()}`;

  console.log("\n" + "█".repeat(60));
  console.log(`█ [${reqId}] DHL RATES  [${USE_PRODUCTION ? "PRODUCTION" : "TEST"}]`);
  console.log("█".repeat(60));

  /* ── Parse body ─────────────────────────────────────────────────────────── */
  let body: any;
  try {
    body = await req.json();
    console.log(`📥 [${reqId}] Body:`, JSON.stringify(body));
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { destinationCountry, totalWeightKg } = body;

  if (!destinationCountry) {
    return NextResponse.json({ success: false, message: "destinationCountry is required" }, { status: 400 });
  }
  if (totalWeightKg == null) {
    return NextResponse.json({ success: false, message: "totalWeightKg is required" }, { status: 400 });
  }

  /* ── Resolve codes ──────────────────────────────────────────────────────── */
  const destCode   = COUNTRY_CODE_MAP[destinationCountry] ?? destinationCountry;
  const isDomestic = destCode === "NG";

  console.log(`\n🌍 [${reqId}] "${destinationCountry}" → "${destCode}" | domestic: ${isDomestic}`);

  /* ── Credentials ────────────────────────────────────────────────────────── */
  const rawKey        = process.env.DHL_API_KEY        ?? "";
  const rawSecret     = process.env.DHL_API_SECRET     ?? "";
  const accountNumber = process.env.DHL_ACCOUNT_NUMBER ?? "";

  console.log(`🔑 [${reqId}] key:"${rawKey.slice(0,4)}…" secret:"${rawSecret.slice(0,4)}…" account:"${accountNumber || "NOT SET"}"`);

  if (!rawKey || !rawSecret) {
    return NextResponse.json({ success: false, message: "DHL credentials not configured" }, { status: 500 });
  }
  if (!accountNumber) {
    console.warn(`⚠️  [${reqId}] DHL_ACCOUNT_NUMBER not set — falling back immediately`);
    return useFallback(reqId, isDomestic, "DHL_ACCOUNT_NUMBER not configured");
  }

  const BASIC_AUTH = Buffer.from(`${rawKey}:${rawSecret}`).toString("base64");

  /* ── Build payload ──────────────────────────────────────────────────────── */
  const weightKg            = Math.max(Number(totalWeightKg) || 0.5, 0.1);
  const receiver            = RECEIVER_POSTAL_CODES[destCode] ?? { postalCode: "00000", cityName: "Destination", countryCode: destCode };
  const isCustomsDeclarable = !isDomestic;

  // ── Date strategy: try today first, then walk forward up to 7 days ────────
  const DATES_TO_TRY = buildDateCandidates(USE_PRODUCTION ? 1 : 0, 7);
  console.log(`📅 [${reqId}] Will try ${DATES_TO_TRY.length} date(s): ${DATES_TO_TRY.join(", ")}`);

  for (let attempt = 0; attempt < DATES_TO_TRY.length; attempt++) {
    const shippingDate = DATES_TO_TRY[attempt];
    console.log(`\n🗓️  [${reqId}] Attempt ${attempt + 1}/${DATES_TO_TRY.length} — date: ${shippingDate}`);

    const payload: any = {
      customerDetails: {
        shipperDetails: {
          postalCode:   SHIPPER.postalCode,
          cityName:     SHIPPER.cityName,
          countryCode:  SHIPPER.countryCode,
          addressLine1: SHIPPER.addressLine1,
        },
        receiverDetails: {
          postalCode:   receiver.postalCode,
          cityName:     receiver.cityName,
          countryCode:  receiver.countryCode,
          addressLine1: "1 Main St",
        },
      },

      // FIX 3: typeCode must be "account" not "shipper" — production rejects "shipper"
      accounts: [
        { typeCode: "account", number: accountNumber },
      ],

      unitOfMeasurement: "metric",
      isCustomsDeclarable,

      // FIX 4: strict ISO 8601 — no space before +00:00
      plannedShippingDateAndTime: shippingDate,

      // FIX 5: "all" is sandbox-only. In production, omit productTypeCode entirely
      // so DHL returns all products your account is enabled for.
      // Only add it back if you need to filter to a specific product.
      ...(USE_PRODUCTION ? {} : { productTypeCode: "all" }),

      packages: [
        {
          weight:     weightKg,
          dimensions: { length: 25, width: 35, height: 15 },
        },
      ],

      ...(isCustomsDeclarable && {
        monetaryAmount: [{ typeCode: "declaredValue", value: 100, currency: "USD" }],
      }),
    };

    console.log(`📤 [${reqId}] Payload:\n`, JSON.stringify(payload, null, 2));
    console.log(`🌐 [${reqId}] POST → ${DHL_API_URL}`);

    /* ── Call DHL ─────────────────────────────────────────────────────────── */
    let response: Response;
    try {
      const t0 = Date.now();
      response = await fetch(DHL_API_URL, {
        method:  "POST",
        headers: {
          "Content-Type":           "application/json",
          "Authorization":          `Basic ${BASIC_AUTH}`,
          "Message-Reference":      `${reqId}-${attempt}`,
          "Message-Reference-Date": new Date().toUTCString(),
          "Accept":                 "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log(`⏱️  [${reqId}] ${Date.now() - t0}ms | HTTP ${response.status}`);
    } catch (fetchErr: any) {
      console.error(`💥 [${reqId}] fetch() threw: ${fetchErr.message}`);
      return useFallback(reqId, isDomestic, "Network error — using estimated rates");
    }

    /* ── Parse response ───────────────────────────────────────────────────── */
    let data: any;
    try {
      data = await response.json();
      console.log(`📨 [${reqId}] DHL response (${response.status}):`, JSON.stringify(data, null, 2));
    } catch {
      return useFallback(reqId, isDomestic, "DHL returned unreadable response");
    }

    /* ── Handle errors ────────────────────────────────────────────────────── */
    if (!response.ok) {
      const reason = String(data?.detail ?? data?.title ?? "DHL API error");
      console.error(`❌ [${reqId}] HTTP ${response.status} — ${reason}`);

      // 996 = no products for this date — try the next date
      if (reason.includes("996")) {
        console.warn(`🔄 [${reqId}] 996 on date ${shippingDate} — trying next date…`);
        continue;
      }

      // 998 = bad account number
      if (reason.includes("998")) {
        console.error(`💡 [${reqId}] 998 = account number rejected. Check DHL_ACCOUNT_NUMBER="${accountNumber}"`);
        return useFallback(reqId, isDomestic, reason);
      }

      // 401 = bad credentials
      if (response.status === 401) {
        console.error(`💡 [${reqId}] 401 = wrong API key/secret`);
        return useFallback(reqId, isDomestic, reason);
      }

      return useFallback(reqId, isDomestic, reason);
    }

    /* ── Map products ─────────────────────────────────────────────────────── */
    const products: any[] = data.products ?? [];
    console.log(`✅ [${reqId}] ${products.length} product(s) returned for date ${shippingDate}`);

    if (!products.length) {
      console.warn(`⚠️  [${reqId}] Empty products — trying next date…`);
      continue;
    }

    const rates = products.map((product: any, i: number) => {
      const price    = extractPrice(product, reqId);
      const currency = extractCurrency(product);
      const eta      = product.deliveryCapabilities?.estimatedDeliveryDateAndTime ?? null;
      console.log(`   [${i + 1}] ${product.productCode} | ${product.productName} | ₦${price.toLocaleString()} | eta=${eta ?? "N/A"}`);
      return {
        productCode:  product.productCode,
        productName:  product.productName,
        price,
        currency,
        deliveryTime: eta,
        isFallback:   false,
      };
    });

    console.log(`🏁 [${reqId}] Returning ${rates.length} live rate(s) (date: ${shippingDate})`);
    return NextResponse.json({ success: true, rates, isFallback: false });
  }

  // All date attempts exhausted
  console.warn(`⚠️  [${reqId}] All ${DATES_TO_TRY.length} date attempts failed — using fallback rates`);
  return useFallback(reqId, isDomestic, "No available pickup dates found — using estimated rates");
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

function buildDateCandidates(startOffsetDays: number, maxDays: number): string[] {
  const candidates: string[] = [];
  const d = new Date();

  d.setUTCDate(d.getUTCDate() + startOffsetDays);

  let added = 0;
  let safetyCounter = 0;

  while (added < maxDays && safetyCounter < 30) {
    safetyCounter++;
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) {
      const iso = d.toISOString().split("T")[0];
      // FIX 4: strict ISO 8601, no "GMT+00:00" format
      candidates.push(`${iso}T10:00:00+00:00`);
      added++;
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }

  return candidates;
}

function useFallback(reqId: string, isDomestic: boolean, reason: string) {
  const key      = isDomestic ? "NG" : "INTL";
  const fallback = FALLBACK_RATES[key];

  console.warn(`⚠️  [${reqId}] FALLBACK triggered (${key}): ${reason}`);

  if (!fallback?.length) {
    return NextResponse.json({ success: false, message: reason }, { status: 503 });
  }

  const rates = fallback.map((r) => ({
    productCode:  r.productCode,
    productName:  r.productName,
    price:        r.price,
    currency:     "NGN",
    deliveryTime: null,
    isFallback:   true,
  }));

  console.warn(`⚠️  [${reqId}] Returning ${rates.length} fallback rate(s)`);
  return NextResponse.json({ success: true, rates, isFallback: true });
}

function extractPrice(product: any, reqId: string): number {
  const totalPrice: any[] = product.totalPrice ?? [];
  const priceObj =
    totalPrice.find((p: any) => p.priceCurrency === "NGN") ??
    totalPrice.find((p: any) => p.priceCurrency === "USD") ??
    totalPrice[0];

  if (!priceObj) {
    console.warn(`   ⚠️  [${reqId}] No price for "${product.productCode}"`);
    return 0;
  }

  if (priceObj.priceCurrency !== "NGN") {
    const converted = Math.round(priceObj.price * 1600);
    console.log(`   💱 [${reqId}] ${priceObj.priceCurrency} ${priceObj.price} → ₦${converted.toLocaleString()} (×1600)`);
    return converted;
  }

  return Math.round(priceObj.price);
}

function extractCurrency(product: any): string {
  return product.totalPrice?.[0]?.priceCurrency ?? "NGN";
}
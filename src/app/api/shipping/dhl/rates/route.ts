import { NextResponse } from "next/server";

// ── Toggle between test and production ──────────────────────────────────────
const USE_PRODUCTION = process.env.DHL_USE_PRODUCTION === "true";

const DHL_API_URL = USE_PRODUCTION
  ? "https://express.api.dhl.com/mydhlapi/rates"
  : "https://express.api.dhl.com/mydhlapi/test/rates";

// ── Startup env validation ───────────────────────────────────────────────────
console.log("\n🔧 [DHL ROUTE] ENV CHECK ON LOAD:");
console.log(`   DHL_API_KEY          : ${process.env.DHL_API_KEY       ? process.env.DHL_API_KEY.slice(0, 4) + "…"       : "❌ NOT SET"}`);
console.log(`   DHL_API_SECRET       : ${process.env.DHL_API_SECRET    ? process.env.DHL_API_SECRET.slice(0, 4) + "…"    : "❌ NOT SET"}`);
console.log(`   DHL_EXPORT_ACCOUNT   : ${process.env.DHL_EXPORT_ACCOUNT || "❌ NOT SET"}`);
console.log(`   DHL_IMPORT_ACCOUNT   : ${process.env.DHL_IMPORT_ACCOUNT || "⚠️  NOT SET (only needed for inbound)"}`);
console.log(`   DHL_USE_PRODUCTION   : ${process.env.DHL_USE_PRODUCTION ?? "unset (→ TEST mode)"}`);
console.log(`   Resolved API URL     : ${DHL_API_URL}\n`);

// ── Shipper origin (fixed: Lagos, NG) ────────────────────────────────────────
// postalCode "00000" is the DHL-accepted code for Nigerian cities (per collection)
const SHIPPER = {
  postalCode:   "00000",
  cityName:     "Ikeja",
  countyName:   "Lagos",   // ← required by DHL; maps to state/province
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
  "Uganda":         "UG",
};

// ── Representative receiver addresses ────────────────────────────────────────
// IMPORTANT: DHL uses "00000" for cities that lack postal codes (e.g. most of Africa).
// For cities that do have postal codes, use the real one — DHL validates them.
const RECEIVER_ADDRESSES: Record<string, {
  postalCode: string;
  cityName:   string;
  countyName: string;   // state / province / region
  countryCode: string;
}> = {
  "NG": { postalCode: "00000", cityName: "Abuja",         countyName: "FCT",            countryCode: "NG" },
  "GH": { postalCode: "00000", cityName: "Accra",         countyName: "Accra",          countryCode: "GH" },
  "KE": { postalCode: "00100", cityName: "Nairobi",       countyName: "Nairobi",        countryCode: "KE" },
  "ZA": { postalCode: "2000",  cityName: "Johannesburg",  countyName: "Gauteng",        countryCode: "ZA" },
  "GB": { postalCode: "EC1A1BB", cityName: "London",      countyName: "England",        countryCode: "GB" },
  "US": { postalCode: "85123", cityName: "Arizona",       countyName: "Arizona",        countryCode: "US" },
  "CA": { postalCode: "M5H2N2",  cityName: "Toronto",     countyName: "Ontario",        countryCode: "CA" },
  "DE": { postalCode: "10115",   cityName: "Berlin",      countyName: "Berlin",         countryCode: "DE" },
  "FR": { postalCode: "75001",   cityName: "Paris",       countyName: "Ile-de-France",  countryCode: "FR" },
  "AE": { postalCode: "00000",   cityName: "Dubai",       countyName: "Dubai",          countryCode: "AE" },
  "UG": { postalCode: "40323",   cityName: "Kampala",     countyName: "Kampala",        countryCode: "UG" },
};

// ── Static fallback rates (used when DHL API is unavailable) ─────────────────
const FALLBACK_RATES: Record<string, Array<{ productCode: string; productName: string; price: number }>> = {
  "NG": [
    { productCode: "N", productName: "DHL Express Domestic", price: 4500  },
  ],
  "INTL": [
    { productCode: "P", productName: "DHL Express Worldwide",  price: 95000 },
    { productCode: "D", productName: "DHL Express Document",   price: 65000 },
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

  const { destinationCountry, totalWeightKg, isDocument } = body;

  if (!destinationCountry) {
    return NextResponse.json({ success: false, message: "destinationCountry is required" }, { status: 400 });
  }
  if (totalWeightKg == null) {
    return NextResponse.json({ success: false, message: "totalWeightKg is required" }, { status: 400 });
  }

  /* ── Resolve codes ──────────────────────────────────────────────────────── */
  const destCode   = COUNTRY_CODE_MAP[destinationCountry] ?? destinationCountry.toUpperCase();
  const isDomestic = destCode === "NG";

  // ── Product code per manual:
  //   N = same-country (domestic)
  //   D = cross-border document
  //   P = cross-border non-document (package)
  const productCode = isDomestic ? "N" : (isDocument ? "D" : "P");

  // ── Account type per manual:
  //   EXP account → NG outbound (NG → Country)
  //   IMP account → NG inbound  (Country → NG)  [domestic also uses EXP]
  // Since this route is always called from Lagos (shipper=NG), direction is always EXP.
  const accountNumber = process.env.DHL_EXPORT_ACCOUNT ?? "";

  console.log(`\n🌍 [${reqId}] "${destinationCountry}" → "${destCode}" | domestic: ${isDomestic} | productCode: ${productCode}`);

  /* ── Credentials ────────────────────────────────────────────────────────── */
  const rawKey    = process.env.DHL_API_KEY    ?? "";
  const rawSecret = process.env.DHL_API_SECRET ?? "";

  console.log(`🔑 [${reqId}] key:"${rawKey.slice(0,4)}…" secret:"${rawSecret.slice(0,4)}…" account:"${accountNumber || "NOT SET"}"`);

  if (!rawKey || !rawSecret) {
    return NextResponse.json({ success: false, message: "DHL credentials not configured" }, { status: 500 });
  }
  if (!accountNumber) {
    console.warn(`⚠️  [${reqId}] DHL_EXPORT_ACCOUNT not set — falling back immediately`);
    return useFallback(reqId, isDomestic, "DHL_EXPORT_ACCOUNT not configured");
  }

  const BASIC_AUTH = Buffer.from(`${rawKey}:${rawSecret}`).toString("base64");

  /* ── Build payload ──────────────────────────────────────────────────────── */
  const weightKg  = Math.max(Number(totalWeightKg) || 0.5, 0.1);
  const receiver  = RECEIVER_ADDRESSES[destCode] ?? {
    postalCode:  "00000",
    cityName:    "Destination",
    countyName:  "N/A",
    countryCode: destCode,
  };

  // isCustomsDeclarable:
  //   false → domestic shipments (per manual)
  //   false → international documents (per collection)
  //   true  → international non-documents/packages (per manual + collection)
  const isCustomsDeclarable = !isDomestic && !isDocument;

  // ── Date strategy: walk forward from today, weekdays only ────────────────
  // nextBusinessDay:true already tells DHL to use the next valid date,
  // but we still need a valid plannedShippingDateAndTime.
  // Nigeria is UTC+1; using +01:00 matches the collection exactly.
  const DATES_TO_TRY = buildDateCandidates(USE_PRODUCTION ? 1 : 0, 7);
  console.log(`📅 [${reqId}] Will try ${DATES_TO_TRY.length} date(s): ${DATES_TO_TRY.join(", ")}`);

  for (let attempt = 0; attempt < DATES_TO_TRY.length; attempt++) {
    const shippingDate = DATES_TO_TRY[attempt];
    console.log(`\n🗓️  [${reqId}] Attempt ${attempt + 1}/${DATES_TO_TRY.length} — date: ${shippingDate}`);

    // Build the payload exactly matching the DHL collection structure.
    // Fields marked "fixed" in the collection are hardcoded; "changeable" are dynamic.
    const payload: any = {
      plannedShippingDateAndTime: shippingDate,  // changeable
      productCode,                                // fixed per shipment type
      unitOfMeasurement: "metric",               // fixed
      isCustomsDeclarable,                       // fixed per shipment type
      nextBusinessDay: true,                     // fixed — required in every rates request
      accounts: [
        {
          number:   accountNumber,               // fixed (EXP account for NG-origin)
          typeCode: "shipper",                   // fixed
        },
      ],
      customerDetails: {                         // changeable
        shipperDetails: {
          addressLine1: SHIPPER.addressLine1,
          postalCode:   SHIPPER.postalCode,
          cityName:     SHIPPER.cityName,
          countyName:   SHIPPER.countyName,
          countryCode:  SHIPPER.countryCode,
        },
        receiverDetails: {
          addressLine1: "1 Main Street",
          postalCode:   receiver.postalCode,
          cityName:     receiver.cityName,
          countyName:   receiver.countyName,
          countryCode:  receiver.countryCode,
        },
      },
      packages: [
        {
          weight:     weightKg,
          dimensions: { length: 30, width: 30, height: 30 },
        },
      ],
    };

    // payerCountryCode is required for international shipments (per collection)
    if (!isDomestic) {
      payload.payerCountryCode = "NG";
    }

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

      // 996 = no products available for this pickup date — try the next date
      if (reason.includes("996")) {
        console.warn(`🔄 [${reqId}] 996 on date ${shippingDate} — trying next date…`);
        continue;
      }

      // 998 = account number rejected — no point retrying dates
      if (reason.includes("998")) {
        console.error(`💡 [${reqId}] 998 = account number rejected. Check DHL_EXPORT_ACCOUNT="${accountNumber}"`);
        return useFallback(reqId, isDomestic, reason);
      }

      // 401 = wrong credentials — no point retrying
      if (response.status === 401) {
        console.error(`💡 [${reqId}] 401 = wrong API key/secret`);
        return useFallback(reqId, isDomestic, reason);
      }

      // Any other error — fall back
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
  return useFallback(reqId, isDomestic, "No available pickup dates — using estimated rates");
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Builds weekday-only date strings in Nigeria local time (UTC+1).
 * Matches the collection format: "2026-05-26T10:00:00 GMT+01:00"
 */
function buildDateCandidates(startOffsetDays: number, maxDays: number): string[] {
  const candidates: string[] = [];
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + startOffsetDays);

  let added = 0, safetyCounter = 0;

  while (added < maxDays && safetyCounter < 30) {
    safetyCounter++;
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) { // weekdays only
      const iso = d.toISOString().split("T")[0];
      // Use Nigeria's timezone offset (+01:00) to match the collection exactly
      candidates.push(`${iso}T10:00:00 GMT+01:00`);
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
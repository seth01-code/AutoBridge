import { NextRequest, NextResponse } from "next/server";

const USE_PRODUCTION = process.env.DHL_USE_PRODUCTION === "true";

const DHL_PICKUP_URL = USE_PRODUCTION
  ? "https://express.api.dhl.com/mydhlapi/pickups"
  : "https://express.api.dhl.com/mydhlapi/test/pickups";

// Fixed shipper / booking location (AutoBridge dispatch hub in Lagos)
const SHIPPER = {
  fullName:     "AutoBridge Marketplace",
  companyName:  "AutoBridge Marketplace",
  phone:        "+2341234567890",
  email:        "dispatch@autobridge.ng",
  addressLine1: "1 Broad Street",
  cityName:     "Lagos",
  countyName:   "Lagos",
  postalCode:   "100001",              // ← was "101001", Lagos Island correct code
  countryCode:  "NG",
};

/**
 * Returns the next business day (Mon–Fri) as a DHL-formatted
 * plannedPickupDateAndTime string: "YYYY-MM-DDTHH:MM GMT+01:00"
 */
function getPickupWindows() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return {
    pickupDate: `${yyyy}-${mm}-${dd}`,
    // DHL-expected format per the official JSON collection:
    // "YYYY-MM-DDTHH:MM GMT+01:00"  (no seconds, space before timezone)
    plannedPickupDateAndTime: `${yyyy}-${mm}-${dd}T10:00 GMT+01:00`,
    closeTime: "16:00",
  };
}

export async function POST(req: NextRequest) {
  const reqId = `PICK-${Date.now()}`;

  try {
    const body = await req.json();
    console.log(`[${reqId}] Body:`, JSON.stringify(body));

    const {
      // Shipment details from the completed waybill
      dhlProductCode = "N", // "N" domestic | "D" intl-document | "P" intl-package
      weightKg = 1,
      lengthCm = 10,
      widthCm = 10,
      heightCm = 10,
      declaredValueUSD = 50, // ← add this line

      // Receiver details — required by DHL Pickup API
      receiverFullName,
      receiverCompany,
      receiverPhone,
      receiverEmail,
      receiverAddressLine1,
      receiverCityName,
      receiverCountyName,
      receiverPostalCode,
      receiverCountryCode = "NG",

      // Optional
      locationDescription = "Front Reception Desk",
      locationType = "business", // "business" | "residence"
    } = body;

    // Receiver contact info is required for the DHL pickup payload
    if (
      !receiverFullName ||
      !receiverPhone ||
      !receiverAddressLine1 ||
      !receiverCityName
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required receiver details: receiverFullName, receiverPhone, " +
            "receiverAddressLine1, receiverCityName.",
        },
        { status: 400 },
      );
    }

    const rawKey = process.env.DHL_API_KEY ?? "";
    const rawSecret = process.env.DHL_API_SECRET ?? "";
    const exportAccount = process.env.DHL_EXPORT_ACCOUNT ?? "";

    if (!rawKey || !rawSecret || !exportAccount) {
      return NextResponse.json(
        { success: false, message: "DHL credentials not configured." },
        { status: 500 },
      );
    }

    const BASIC_AUTH = Buffer.from(`${rawKey}:${rawSecret}`).toString("base64");
    const { plannedPickupDateAndTime, closeTime } = getPickupWindows();

    // ── Pickup Payload — aligned with DHL JSON collection samples ────────────
    //
    // Key corrections vs. the previous version:
    //  1. "locationType" (not "locationTypeCode") — matches DHL sample
    //  2. shipmentDetails uses "packages[].weight + dimensions" (not totalWeight)
    //  3. "shipmentTrackingNumber" is NOT a valid pickup payload field — removed
    //  4. "receiverDetails" added — required by DHL
    //  5. "isCustomsDeclarable" added per product code rules
    //  6. Timestamp format "YYYY-MM-DDTHH:MM GMT+01:00" (no seconds) per samples
    // ─────────────────────────────────────────────────────────────────────────
    const payload = {
      plannedPickupDateAndTime,
      closeTime,
      location: locationDescription,
      locationType, // ✅ correct field name

      accounts: [
        {
          typeCode: "shipper",
          number: exportAccount,
        },
      ],

    customerDetails: {
  shipperDetails: {
    postalAddress: {
      addressLine1: SHIPPER.addressLine1,
      cityName:     SHIPPER.cityName,
      countyName:   SHIPPER.countyName,
      postalCode:   SHIPPER.postalCode,
      countryCode:  SHIPPER.countryCode,
    },
    contactInformation: {
      fullName:    SHIPPER.fullName,
      companyName: SHIPPER.companyName,
      phone:       SHIPPER.phone,
      email:       SHIPPER.email,
    },
  },
  receiverDetails: {
    postalAddress: {
      addressLine1: receiverAddressLine1,
      cityName:     receiverCityName,
      countyName:   receiverCountyName  || receiverCityName,   // ← always a value
      postalCode:   receiverPostalCode  || "000000",           // ← always a value
      countryCode:  receiverCountryCode,
    },
    contactInformation: {
      fullName:    receiverFullName,
      companyName: receiverCompany      || receiverFullName,
      phone:       receiverPhone,
      email:       receiverEmail        || SHIPPER.email,      // ← always a value
    },
  },
},
      // ✅ shipmentDetails now uses packages[].weight + dimensions (not totalWeight)
      // ✅ isCustomsDeclarable follows product code rules:
      //      "N" (domestic) → false | "D" (intl doc) → false | "P" (intl pkg) → true
      shipmentDetails: [
        {
          productCode: dhlProductCode,
          isCustomsDeclarable: dhlProductCode === "P",
          ...(dhlProductCode === "P" && {
            declaredValue: Math.max(Number(declaredValueUSD) || 50, 1),
            declaredValueCurrency: "USD",
          }),
          unitOfMeasurement: "metric",
          packages: [
            {
              weight: Math.max(Number(weightKg) || 1, 0.1),
              dimensions: {
                length: Number(lengthCm) || 10,
                width: Number(widthCm) || 10,
                height: Number(heightCm) || 10,
              },
            },
          ],
        },
      ],
    };

    console.log(`[${reqId}] → ${DHL_PICKUP_URL}`);
    console.log(`[${reqId}] Payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch(DHL_PICKUP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${BASIC_AUTH}`,
        "Message-Reference": reqId,
        "Message-Reference-Date": new Date().toUTCString(),
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(
      `[${reqId}] DHL Pickup ${response.status}:`,
      JSON.stringify(data, null, 2),
    );

    if (!response.ok) {
      const reason =
        data?.detail ?? data?.title ?? "DHL Pickup scheduling failed.";
      return NextResponse.json(
        { success: false, message: reason, _dhlRaw: data },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      pickupConfirmationNumber: data.pickupConfirmationNumber,
      readyByTime: data.readyByTime,
      message: "Courier dispatch booked successfully.",
    });
  } catch (err: any) {
    console.error(`[${reqId}] error:`, err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}

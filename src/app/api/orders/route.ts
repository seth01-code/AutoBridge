import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";

/* ─────────────────────────────────────────────
   GET /api/orders
   Query params:
     ?userId=xxx          → customer's own orders
     ?vendorName=xxx      → orders containing items from this vendor
                            (case-insensitive match on items.vendor)
     ?role=admin          → all orders (admin only)
     ?status=paid,shipped → comma-separated status filter
     ?limit=50&page=1
───────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId     = searchParams.get("userId");
    const vendorName = searchParams.get("vendorName") ?? searchParams.get("vendorId");
    const role       = searchParams.get("role");
    const status     = searchParams.get("status");
    const limit      = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const page       = Math.max(parseInt(searchParams.get("page") ?? "1"), 1);
    const skip       = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (role === "admin") {
      // No filter — admin sees everything
      console.log("[GET /api/orders] admin query — returning all orders");
    } else if (vendorName) {
      /*
       * Case-insensitive exact match on the vendor display name stored on
       * each order item.  The value in the DB for the sample order is
       * "AutoBridge Vendor" — make sure the user.vendorName on the JWT/session
       * matches that string (casing doesn't matter because of the `i` flag).
       *
       * If your vendors can sell items across orders from multiple vendor
       * names, consider switching to a vendorId field instead.
       */
      const escaped = vendorName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query["items.vendor"] = { $regex: new RegExp(`^${escaped}$`, "i") };
      console.log(`[GET /api/orders] vendor query: items.vendor ~ "${vendorName}"`);
    } else if (userId) {
      query["userId"] = userId;
      console.log(`[GET /api/orders] customer query: userId="${userId}"`);
    } else {
      return NextResponse.json(
        { success: false, message: "Provide userId, vendorName, or role=admin" },
        { status: 400 },
      );
    }

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      query["status"] = { $in: statuses };
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    console.log(`[GET /api/orders] found ${orders.length} / ${total} orders`);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
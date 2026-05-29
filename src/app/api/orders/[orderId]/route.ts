import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";

/* ─────────────────────────────────────────────
   GET /api/orders/[orderId]
   Single order — used by vendor detail modal
   and customer order-confirmation page.
───────────────────────────────────────────── */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectDB();
    const { orderId } = await params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}

/* ─────────────────────────────────────────────
   PATCH /api/orders/[orderId]
   Used by vendors and admins to:
     • Approve  → status: "processing"
     • Cancel   → status: "cancelled"
     • Ship     → status: "shipped" + trackingNumber + labelUrl + shippedAt
     • Deliver  → status: "delivered"
     • Refund   → status: "refunded"

   Body (all optional, only provided fields updated):
   {
     status?:         string,
     trackingNumber?: string,
     labelUrl?:       string,
     shippedAt?:      string (ISO date),
   }
───────────────────────────────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectDB();
    const { orderId } = await params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const updatePayload: Record<string, any> = {};

    const ALLOWED_STATUSES = [
      "pending_payment", "paid", "processing", "shipped",
      "delivered", "cancelled", "refunded",
    ];

    if (body.status) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: `Invalid status: ${body.status}` },
          { status: 400 },
        );
      }
      updatePayload["status"] = body.status;
    }

    if (body.trackingNumber !== undefined)
      updatePayload["shipping.trackingNumber"] = body.trackingNumber;

    if (body.labelUrl !== undefined)
      updatePayload["shipping.labelUrl"] = body.labelUrl;

    if (body.shippedAt)
      updatePayload["shipping.shippedAt"] = new Date(body.shippedAt);

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: updatePayload },
      { new: true },
    ).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    console.error("[PATCH /api/orders/:orderId]", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Order";

/* ─────────────────────────────────────────────
   GET /api/checkout/[orderId]
   Fetch a single order by MongoDB _id.
   Used by the order-confirmation page and
   vendor/admin dashboards.
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
   PATCH /api/checkout/[orderId]
   Used by vendors/admins to:
   - Update order status
   - Add tracking number + label URL after DHL dispatch
   Body: { status?, trackingNumber?, labelUrl?, shippedAt? }
───────────────────────────────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectDB();

    const { orderId } = await params;
    const body = await req.json();

    const allowed = ["status", "shipping.trackingNumber", "shipping.labelUrl", "shipping.shippedAt"];

    const updatePayload: Record<string, any> = {};

    if (body.status)   updatePayload["status"] = body.status;
    if (body.trackingNumber) updatePayload["shipping.trackingNumber"] = body.trackingNumber;
    if (body.labelUrl)       updatePayload["shipping.labelUrl"] = body.labelUrl;
    if (body.shippedAt)      updatePayload["shipping.shippedAt"] = new Date(body.shippedAt);

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
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
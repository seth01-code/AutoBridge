import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/mongodb";
import Order from "../../../models/Order";
import Cart from "../../../models/Cart";

/* ─────────────────────────────────────────────
   HELPER — generate order number
   Called before Order.create() so there is no
   dependency on a pre-save hook at all.
───────────────────────────────────────────── */
async function generateOrderNumber(): Promise<string> {
  const count = await Order.countDocuments();
  const year  = new Date().getFullYear();
  return `AB-${year}-${String(count + 1).padStart(5, "0")}`;
}

/* ─────────────────────────────────────────────
   POST /api/checkout
   Creates an order after Paystack payment succeeds.
───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("[CHECKOUT BODY]", body);

    const {
      userId,
      paystackRef,
      cart,
      address,
      shipping,
      subtotal,
      shippingCost,
      discount,
      total,
      promoCode = "",
    } = body;

    /* ── Validation ── */
    if (
      !userId      ||
      !paystackRef ||
      !cart?.length ||
      !address     ||
      !shipping    ||
      !shipping.rateId   ||
      !shipping.carrier  ||
      !shipping.name
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ── Prevent duplicate orders ── */
    const existingOrder = await Order.findOne({ paystackRef });
    if (existingOrder) {
      return NextResponse.json(
        {
          success: true,
          data: {
            orderId:     existingOrder._id,
            orderNumber: existingOrder.orderNumber,
            status:      existingOrder.status,
          },
          message: "Order already exists",
        },
        { status: 200 }
      );
    }

    /* ── Map cart items ── */
    const items = cart.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      name:      item.name,
      image:     item.image     ?? "",
      vendor:    item.vendor    ?? "",
      price:     Number(item.price),
      quantity:  Number(item.quantity ?? 1),
      weight:    Number(item.weight   ?? 0.5),
    }));

    /* ── Generate order number before insert ── */
    const orderNumber = await generateOrderNumber();

    /* ── Create order ── */
    const order = await Order.create({
      userId,
      orderNumber,
      items,
      address,
      shipping: {
        rateId:         shipping.rateId,
        carrier:        shipping.carrier,
        name:           shipping.name,
        price:          shipping.price,
        eta:            shipping.eta            ?? "",
        dhlProductCode: shipping.dhlProductCode ?? "",
      },
      subtotal,
      shippingCost,
      discount,
      total,
      currency:       "NGN",
      promoCode,
      paymentMethod:  "paystack",
      paystackRef,
      paystackStatus: "success",
      status:         "paid",
    });

    /* ── Clear user cart ── */
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId:     order._id,
          orderNumber: order.orderNumber,
          status:      order.status,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/checkout]", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────────────────────
   GET /api/checkout?userId=...
   Returns all orders for a user, newest first.
───────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId required" },
        { status: 400 }
      );
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
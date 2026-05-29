import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/mongodb";
import Cart from "../../../models/Cart";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });

    return NextResponse.json({
      success: true,
      data: cart || { items: [] },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, productId, name, image, vendor, price, quantity = 1 } = body;

    // ── Validate required fields ──
    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: "userId and productId are required" },
        { status: 400 }
      );
    }

    // ── Cast productId to ObjectId — this is the critical fix ──
    // Mongoose won't silently accept a plain string for an ObjectId field in all cases.
    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(productId);
    } catch {
      return NextResponse.json(
        { success: false, message: `Invalid productId: ${productId}` },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item: any) => item.productId.toString() === objectId.toString()
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: objectId,  // pass the casted ObjectId, not the raw string
        name,
        image,
        vendor,               // ← now persisted
        price,
        quantity,
      });
    }

    await cart.save();

    return NextResponse.json({ success: true, data: cart });
  } catch (err: any) {
    console.error("[POST /api/cart] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
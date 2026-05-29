import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";
import Cart from "../../../../models/Cart";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectDB();

    const { productId } = await params;
    const body = await req.json();
    const { userId, quantity } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    // ── Cast productId to ObjectId ──
    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(productId);
    } catch {
      return NextResponse.json(
        { success: false, message: `Invalid productId: ${productId}` },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    const item = cart.items.find(
      (item: any) => item.productId.toString() === objectId.toString()
    );

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Item not found in cart" },
        { status: 404 }
      );
    }

    if (quantity < 1) {
      // treat qty < 1 as a remove
      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== objectId.toString()
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    return NextResponse.json({ success: true, data: cart });
  } catch (err: any) {
    console.error("[PATCH /api/cart/:productId] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectDB();

    const { productId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    // ── Cast productId to ObjectId ──
    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(productId);
    } catch {
      return NextResponse.json(
        { success: false, message: `Invalid productId: ${productId}` },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== objectId.toString()
    );

    await cart.save();

    return NextResponse.json({ success: true, data: cart });
  } catch (err: any) {
    console.error("[DELETE /api/cart/:productId] error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
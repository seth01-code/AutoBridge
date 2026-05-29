import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "../../../lib/mongodb";
import Product from "../../../models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const vendorId = searchParams.get("vendorId");
    const category = searchParams.get("category");

    const query: any = {};

    if (vendorId) query.vendorId = vendorId;
    if (category) query.category = category;

    const products = await Product.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 },
    );
  }
}
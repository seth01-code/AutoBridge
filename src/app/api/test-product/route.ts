import { connectDB } from "../../../lib/mongodb";
import Product from "../../../models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const count = await Product.countDocuments();

    return NextResponse.json({
      success: true,
      products: count,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "../../../../lib/mongodb";

import { parseExcel } from "../../../../lib/excel";

import { bulkImportProducts } from "../../../../services/bulk-product-import";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const file = formData.get("file") as File;

    const vendorId = formData.get(
      "vendorId"
    ) as string;

    if (!file || !vendorId) {
      return NextResponse.json(
        {
          success: false,
          error: "file and vendorId required",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const rows = parseExcel(buffer);

    const result = await bulkImportProducts(
      rows,
      vendorId
    );

    return NextResponse.json({
      success: true,
      result,
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
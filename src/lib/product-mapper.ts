import { ExcelProductSchema } from "./validators/bulk-product.schema";

export function mapExcelProducts(rows: any[], vendorId: string) {
  return rows.map((row, index) => {
    const parsed = ExcelProductSchema.safeParse(row);

    if (!parsed.success) {
      return {
        success: false,
        row: index + 1,
        error: parsed.error.format(),
      };
    }

    const data = parsed.data;

    return {
      success: true,
      data: {
        name: data.name,
        sku: data.sku,
        vendorId,

        price: Number(data.price),
        stock: Number(data.stock),

        category: data.category,

        images: data.images
          ? data.images.split(",").map((img) => img.trim())
          : [],

        weight: data.weight || 0,

        dimensions: {
          length: data.length || 0,
          width: data.width || 0,
          height: data.height || 0,
        },

        rating: 0,
        reviewsCount: 0,
        isActive: true,
      },
    };
  });
}
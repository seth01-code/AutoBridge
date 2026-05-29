import slugify from "slugify";
import Product from "../models/Product";
import { BulkProductSchema } from "../lib/validators/bulk-product.schema";

/**
 * -----------------------------
 * DATA SANITIZERS (CRITICAL)
 * -----------------------------
 */

function toNumber(value: any, fallback = 0) {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

function toArray(value: any) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * -----------------------------
 * BULK IMPORT FUNCTION
 * -----------------------------
 */

export async function bulkImportProducts(
  rows: any[],
  vendorId: string
) {
  const success: any[] = [];
  const failed: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    /**
     * -----------------------------
     * CLEAN EXCEL ROW FIRST
     * -----------------------------
     */
    const cleanedRow = {
      name: row.name,
      sku: row.sku,
      description: row.description,
      category: row.category,

      price: toNumber(row.price),
      stock: toNumber(row.stock),

      images: row.images,

      weight: toNumber(row.weight),
      length: toNumber(row.length),
      width: toNumber(row.width),
      height: toNumber(row.height),
    };

    /**
     * -----------------------------
     * VALIDATE WITH ZOD
     * -----------------------------
     */
    const parsed = BulkProductSchema.safeParse(cleanedRow);

    if (!parsed.success) {
      failed.push({
        row: i + 1,
        errors: parsed.error.flatten(),
      });
      continue;
    }

    const data = parsed.data;

    /**
     * -----------------------------
     * CHECK DUPLICATE SKU
     * -----------------------------
     */
    const existing = await Product.findOne({
      sku: data.sku,
    });

    if (existing) {
      failed.push({
        row: i + 1,
        error: `SKU already exists: ${data.sku}`,
      });
      continue;
    }

    /**
     * -----------------------------
     * SLUG GENERATION
     * -----------------------------
     */
    const slug = slugify(data.name, {
      lower: true,
      strict: true,
    });

    /**
     * -----------------------------
     * BUILD PRODUCT OBJECT
     * -----------------------------
     */
    success.push({
      name: data.name,
      slug: `${slug}-${Date.now()}-${i}`,
      description: data.description,
      sku: data.sku.toUpperCase(),
      vendorId,
      category: data.category,

      images: toArray(data.images),

      price: data.price,
      stock: data.stock,
      inStock: data.stock > 0,

      weight: data.weight,

      dimensions: {
        length: data.length,
        width: data.width,
        height: data.height,
      },

      rating: 0,
      reviewsCount: 0,
      status: "published",
    });
  }

  /**
   * -----------------------------
   * BULK INSERT
   * -----------------------------
   */
  if (success.length > 0) {
    await Product.insertMany(success);
  }

  return {
    inserted: success.length,
    failed,
  };
}
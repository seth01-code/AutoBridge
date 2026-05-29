import { z } from "zod";

export const BulkProductSchema = z.object({
  name: z.string().min(2),

  sku: z.string().min(2),

  description: z.string().optional(),

  category: z.string().min(2),

  price: z.coerce.number().positive(),

  stock: z.coerce.number().nonnegative(),

  images: z.string().optional(),

  weight: z.coerce.number().nonnegative(),

  length: z.coerce.number().nonnegative(),

  width: z.coerce.number().nonnegative(),

  height: z.coerce.number().nonnegative(),
});
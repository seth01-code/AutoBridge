export type ProductStatus = |"draft" | "pending" | "Published" | "Rejected";

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  VendorId: string;
  category: string;
  tags?: string[];
  images: string[];
  price: number;
  comparePrice?: number;
  currency: string;
  stock: number;
  inStock: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  rating: number;
  reviewsCount: number;
  featured: boolean;
  status: ProductStatus;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}


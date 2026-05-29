import { Product as BackendProduct } from "./product";

export interface ProductUI {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;

  vendor: string;
  category: string;

  images: string[];
  image: string;

  price: number;
  originalPrice: number | null;

  rating: number;
  reviews: number;

  stock: number;
  inStock: boolean;

  createdAt: number;

  tag: string | null;
}
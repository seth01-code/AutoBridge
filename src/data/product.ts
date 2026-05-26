export type Product = {
  id: number;
  name: string;
  vendor: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  tag?: "Trending" | "Fast Shipping" | "Best Seller" | null;
  inStock: boolean;
  createdAt: number;
};

const imageMap: Record<string, string[]> = {
  Fashion: [
    "photo-1509631179647-0177331693ae",
    "photo-1529139574466-a303027c1d8b",
    "photo-1512436991641-6745cdb1723f",
  ],
  Electronics: [
    "photo-1517336714731-489689fd1ca8",
    "photo-1518770660439-4636190af475",
    "photo-1510557880182-3d4d3cba35a5",
  ],
  Home: [
    "photo-1484154218962-a197022b5858",
    "photo-1586023492125-27b2c045efd7",
    "photo-1505691938895-1758d7feb511",
  ],
  Beauty: [
    "photo-1522335789203-aabd1fc54bc9",
    "photo-1596462502278-27bfdc403348",
    "photo-1516975080664-ed2fc6a32937",
  ],
  Sports: [
    "photo-1517649763962-0c623066013b",
    "photo-1552674605-db6ffd4facb5",
    "photo-1546519638-68e109498ffc",
  ],
};

const categories = ["Fashion", "Electronics", "Home", "Beauty", "Sports"];

export const products: Product[] = Array.from({ length: 120 }).map((_, i) => {
  const category = categories[i % categories.length];

  const images = imageMap[category];

  return {
    id: i + 1,
    name: `${category} Premium Product ${i + 1}`,
    vendor: `Verified Vendor ${i % 15}`,
    price: 5000 + ((i * 137) % 90000),
    originalPrice: i % 3 === 0 ? 12000 + ((i * 199) % 120000) : null,
    rating: Number((3 + (i % 20) / 10).toFixed(1)),
    reviews: 20 + ((i * 7) % 800),
    category,
    tag:
      i % 7 === 0
        ? "Trending"
        : i % 11 === 0
          ? "Fast Shipping"
          : i % 13 === 0
            ? "Best Seller"
            : null,
    inStock: i % 9 !== 0, // real stock/out-of-stock distribution
    image: `https://images.unsplash.com/${images[i % images.length]}?auto=format&fit=crop&w=800&q=80`,
    createdAt: Date.now() - i * 86400000,
  };
});

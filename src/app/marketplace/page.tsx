"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProductUI } from "../../types/product-ui";

import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  Star,
  ShoppingCart,
  Shield,
  Heart,
  TrendingUp,
  Zap,
  Check,
  X,
  Package,
  Sparkles,
  Store,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CartDrawer from "../components/Cart/cartDrawer"; // adjust path
import { useCart } from "../context/Cartcontext";           // adjust path

/* ─────────────────────────────────────────────
   VENDOR ID → DISPLAY NAME MAP
───────────────────────────────────────────── */
const VENDOR_NAMES: Record<string, string> = {
  "VENDOR-MOCK-001": "AutoBridge Vendor",
};

function resolveVendorName(vendorId: string): string {
  return VENDOR_NAMES[vendorId] ?? vendorId;
}

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
function SkeletonCard({ list = false }: { list?: boolean }) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-pulse ${
        list ? "flex gap-6" : ""
      }`}
    >
      <div className={`bg-white/10 ${list ? "w-[280px] flex-shrink-0 h-48" : "aspect-square"}`} />
      <div className={`p-5 flex flex-col gap-3 ${list ? "flex-1" : ""}`}>
        <div className="h-3 w-1/3 bg-white/10 rounded-full" />
        <div className="h-5 w-3/4 bg-white/10 rounded-full" />
        <div className="h-4 w-1/2 bg-white/10 rounded-full" />
        <div className="mt-auto flex justify-between items-end">
          <div className="h-7 w-28 bg-white/10 rounded-full" />
          <div className="h-12 w-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function MarketplacePage() {
  /* ── CART CONTEXT ── */
  const {
    addToCart,
    cartCount,
    wishlist,
    toggleWishlist,
    isWishlisted,
    openDrawer,
  } = useCart();

  /* ── LOCAL UI STATE ── */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [allProducts, setAllProducts] = useState<ProductUI[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("popular");

  const PER_PAGE = 12;

  /* ── FETCH PRODUCTS ── */
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products?vendorId=VENDOR-MOCK-001");
      const data = await res.json();
      if (!data.success) return;

      const mapped: ProductUI[] = data.data.map((p: any) => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? "",
        sku: p.sku,
        vendor: resolveVendorName(p.vendorId ?? ""),
        category: p.category,
        images: p.images ?? [],
        image: p.images?.[0] ?? "/placeholder.png",
        price: p.price,
        originalPrice: p.comparePrice ?? null,
        rating: p.rating ?? 0,
        reviews: p.reviewsCount ?? 0,
        stock: p.stock ?? 0,
        inStock: p.inStock ?? p.stock > 0,
        createdAt: new Date(p.createdAt).getTime(),
        tag: p.featured ? "Trending" : null,
      }));

      setAllProducts(mapped);
      setCategories(Array.from(new Set(mapped.map((p) => p.category))).sort());
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── HELPERS ── */
  function toggleCategory(category: string) {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  function clearFilters() {
    setSelectedCategories([]);
    setMinRating(null);
    setMinPrice(null);
    setMaxPrice(null);
    setInStockOnly(false);
    setSearch("");
    setSort("popular");
  }

  /* ── FILTERING ── */
  const filtered = useMemo(() => {
    let data = [...(allProducts ?? [])];
    if (search)
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.vendor.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      );
    if (selectedCategories.length > 0)
      data = data.filter((p) => selectedCategories.includes(p.category));
    if (minRating) data = data.filter((p) => p.rating >= minRating);
    if (minPrice !== null) data = data.filter((p) => p.price >= minPrice);
    if (maxPrice !== null) data = data.filter((p) => p.price <= maxPrice);
    if (inStockOnly) data = data.filter((p) => p.inStock);
    if (sort === "price_low") data.sort((a, b) => a.price - b.price);
    if (sort === "price_high") data.sort((a, b) => b.price - a.price);
    if (sort === "rating") data.sort((a, b) => b.rating - a.rating);
    if (sort === "newest") data.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "popular") data.sort((a, b) => b.reviews - a.reviews);
    return data;
  }, [allProducts, search, selectedCategories, minRating, minPrice, maxPrice, inStockOnly, sort]);

  /* ── PAGINATION ── */
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  /* ── Cart product shape for context ── */
  function toCartProduct(p: ProductUI) {
    return {
      id: p.id,
      name: p.name,
      image: p.image,
      vendor: p.vendor,
      price: p.price,
      inStock: p.inStock,
    };
  }

  /* ── Wishlist products for the drawer ── */
  const cartProducts = allProducts.map(toCartProduct);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      <Navbar />

      {/* CartDrawer — passes all products so wishlist can render details */}
      <CartDrawer allProducts={cartProducts} />

      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <div className="p-6 space-y-8">

          {/* ── HERO ── */}
          <div className="relative bg-gradient-to-br from-[var(--surface)] to-[var(--background)] border border-[var(--border)] rounded-3xl p-8 overflow-hidden">
  {/* decorative blobs */}
  <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--primary)]/10 blur-3xl" />
  <div className="pointer-events-none absolute bottom-0 left-10 w-40 h-40 rounded-full bg-[var(--primary)]/5 blur-2xl" />

  <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

    {/* LEFT TEXT */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-[var(--primary)]" />
        <span className="text-[var(--primary)] text-sm font-medium">
          Verified Vendors
        </span>
      </div>

      <h1 className="text-4xl font-bold leading-tight text-[var(--text-primary)]">
        Discover Premium<br />Products
      </h1>

      <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
        Shop from verified vendors across food, fashion, electronics, beauty and more.
      </p>
    </div>

    {/* ACTIONS */}
    <div className="flex items-center gap-3 self-start">

      {/* Wishlist */}
      <button
        onClick={() => openDrawer("wishlist")}
        className="relative bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--primary-border)] hover:bg-[var(--primary-light)] transition-all px-4 py-3 rounded-xl flex items-center gap-2"
      >
        <Heart
          size={18}
          className={wishlist.length > 0 ? "text-red-500 fill-red-500" : "text-[var(--text-secondary)]"}
        />
        <span className="text-sm text-[var(--text-primary)]">Saved</span>

        {wishlist.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* Cart */}
      <button
        onClick={() => openDrawer("cart")}
        className="relative bg-[var(--primary)] hover:opacity-90 active:scale-[0.98] transition-all px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-black/10"
      >
        <ShoppingCart size={18} className="text-white" />
        <span className="text-sm font-medium text-white">Cart</span>

        {cartCount > 0 && (
          <span className="bg-white text-[var(--primary)] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </div>

  {/* SEARCH */}
  <div className="relative mt-8 max-w-2xl">
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
      size={18}
    />

    <input
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      placeholder="Search products, vendors or categories…"
      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] outline-none focus:border-[var(--primary)] transition-all text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
    />

    {search && (
      <button
        onClick={() => setSearch("")}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
      >
        <X size={16} />
      </button>
    )}
  </div>
</div>

          {/* ── BODY ── */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── SIDEBAR ── */}
            <aside className="lg:w-72 space-y-5 flex-shrink-0">

  {/* FILTER CARD */}
  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 space-y-6">

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-[var(--primary)]" />
        <h3 className="font-semibold text-sm text-[var(--text-primary)]">
          Filters
        </h3>
      </div>

      {(selectedCategories.length > 0 || minRating || minPrice || maxPrice || inStockOnly) && (
        <button
          onClick={clearFilters}
          className="text-xs text-[var(--primary)] hover:underline"
        >
          Reset all
        </button>
      )}
    </div>

    {/* CATEGORY */}
    <div>
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
        Categories
      </p>

      <div className="space-y-2">
        {loadingProducts
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 bg-[var(--surface-2)] rounded-full animate-pulse"
              />
            ))
          : categories.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">No categories</p>
            ) : (
              categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-3 text-sm text-[var(--text-secondary)] cursor-pointer group"
                >
                  <span
                    className={`w-4 h-4 rounded flex-shrink-0 border transition-all flex items-center justify-center ${
                      selectedCategories.includes(cat)
                        ? "bg-[var(--primary)] border-[var(--primary)]"
                        : "border-[var(--border)] group-hover:border-[var(--primary-border)]"
                    }`}
                  >
                    {selectedCategories.includes(cat) && (
                      <Check size={10} className="text-white" />
                    )}
                  </span>

                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />

                  {cat}
                </label>
              ))
            )}
      </div>
    </div>

    {/* PRICE */}
    <div className="pt-5 border-t border-[var(--border)]">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
        Price Range
      </p>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min ₦"
          value={minPrice ?? ""}
          onChange={(e) => setMinPrice(Number(e.target.value) || null)}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
        />

        <input
          type="number"
          placeholder="Max ₦"
          value={maxPrice ?? ""}
          onChange={(e) => setMaxPrice(Number(e.target.value) || null)}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
        />
      </div>
    </div>

    {/* RATING */}
    <div className="pt-5 border-t border-[var(--border)]">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
        Min Rating
      </p>

      <div className="space-y-2">
        {[5, 4, 3].map((r) => (
          <label
            key={r}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span
              className={`w-4 h-4 rounded-full flex-shrink-0 border transition-all flex items-center justify-center ${
                minRating === r
                  ? "bg-[var(--primary)] border-[var(--primary)]"
                  : "border-[var(--border)]"
              }`}
            >
              {minRating === r && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>

            <input
              type="radio"
              name="rating"
              className="sr-only"
              checked={minRating === r}
              onChange={() => setMinRating(r)}
            />

            <div className="flex items-center gap-0.5">
              {[...Array(r)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
              <span className="ml-1 text-xs text-[var(--text-muted)]">
                & up
              </span>
            </div>
          </label>
        ))}

        {minRating && (
          <button
            onClick={() => setMinRating(null)}
            className="text-xs text-[var(--primary)] hover:underline mt-1"
          >
            Clear rating
          </button>
        )}
      </div>
    </div>

    {/* STOCK */}
    <div className="pt-5 border-t border-[var(--border)]">
      <label className="flex items-center gap-3 cursor-pointer">
        <span
          className={`w-4 h-4 rounded flex-shrink-0 border transition-all flex items-center justify-center ${
            inStockOnly
              ? "bg-[var(--primary)] border-[var(--primary)]"
              : "border-[var(--border)]"
          }`}
        >
          {inStockOnly && <Check size={10} className="text-white" />}
        </span>

        <input
          type="checkbox"
          className="sr-only"
          checked={inStockOnly}
          onChange={() => setInStockOnly(!inStockOnly)}
        />

        <span className="text-sm text-[var(--text-secondary)]">
          In Stock Only
        </span>
      </label>
    </div>
  </div>

  {/* BUYER PROTECTION */}
  <div className="bg-gradient-to-br from-[var(--primary)] to-orange-600 rounded-3xl p-6 relative overflow-hidden text-white">

    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_70%,white,transparent)]" />

    <Shield className="mb-3 relative" size={24} />

    <h3 className="font-bold relative">Buyer Protection</h3>

    <p className="text-white/80 text-xs mt-1.5 relative leading-relaxed">
      All purchases are protected with secure checkout and verified vendor assurance.
    </p>
  </div>
</aside>

            {/* ── MAIN ── */}
            <main className="flex-1 min-w-0">
              {/* TOPBAR */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <p className="text-muted-theme text-sm">
    {loadingProducts ? (
      <span className="bg-surface-2 rounded-full h-4 w-28 inline-block animate-pulse" />
    ) : (
      <>
        Showing{" "}
        <span className="text-primary-theme font-semibold">
          {filtered.length}
        </span>{" "}
        products
      </>
    )}
  </p>

  <div className="flex items-center gap-3">
    <select
      value={sort}
      onChange={(e) => setSort(e.target.value)}
      className="bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm text-primary-theme focus:border-primary outline-none"
    >
      <option value="popular">Most Popular</option>
      <option value="price_low">Price: Low → High</option>
      <option value="price_high">Price: High → Low</option>
      <option value="rating">Best Rating</option>
      <option value="newest">Newest First</option>
    </select>

    <div className="flex items-center border border-border rounded-xl p-1 bg-surface-2">
      <button
        onClick={() => setViewMode("grid")}
        className={`p-2 rounded-lg transition-all ${
          viewMode === "grid"
            ? "bg-primary text-white"
            : "text-muted-theme hover:bg-surface"
        }`}
      >
        <Grid3x3 size={16} />
      </button>

      <button
        onClick={() => setViewMode("list")}
        className={`p-2 rounded-lg transition-all ${
          viewMode === "list"
            ? "bg-primary text-white"
            : "text-muted-theme hover:bg-surface"
        }`}
      >
        <List size={16} />
      </button>
    </div>
  </div>
</div>

              {/* LOADING SKELETONS */}
              {loadingProducts && (
  <div
    className={
      viewMode === "grid"
        ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
        : "space-y-5"
    }
  >
    {[...Array(6)].map((_, i) => (
      <SkeletonCard key={i} list={viewMode === "list"} />
    ))}
  </div>
)}

{/* EMPTY STATE */}
{!loadingProducts && filtered.length === 0 && (
  <div className="flex flex-col items-center justify-center py-32 text-muted-theme gap-4">
    <Package size={52} strokeWidth={1} className="text-muted-theme" />

    <p className="text-lg text-primary-theme">No products found</p>

    <button
      onClick={clearFilters}
      className="text-primary hover:underline text-sm"
    >
      Clear all filters
    </button>
  </div>
)}

              {/* PRODUCTS */}
             {!loadingProducts && filtered.length > 0 && (
  <div
    className={
      viewMode === "grid"
        ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
        : "space-y-5"
    }
  >
    {paginated.map((product) => (
      <div
        key={product.id}
        className={`group bg-surface border border-border rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 ${
          viewMode === "list" ? "flex gap-0" : ""
        }`}
      >
        {/* IMAGE */}
        <Link
          href={`/marketplace/${product.id}`}
          className={viewMode === "list" ? "w-[220px] flex-shrink-0" : "block"}
        >
          <div
            className={`relative overflow-hidden ${
              viewMode === "list" ? "h-full min-h-[180px]" : "aspect-square"
            }`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {product.tag && (
              <div className="absolute top-3 left-3">
                <span className="bg-primary text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shadow-lg">
                  {product.tag === "Trending" && <TrendingUp size={10} />}
                  {product.tag === "Fast Shipping" && <Zap size={10} />}
                  {product.tag}
                </span>
              </div>
            )}

            {/* WISHLIST */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                isWishlisted(product.id)
                  ? "bg-red-500 text-white"
                  : "bg-surface-2 text-muted-theme hover:bg-surface"
              }`}
            >
              <Heart
                size={14}
                className={isWishlisted(product.id) ? "fill-white" : ""}
              />
            </button>
          </div>
        </Link>

        {/* CONTENT */}
        <div
          className={`p-4 flex flex-col justify-between ${
            viewMode === "list" ? "flex-1" : ""
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-muted-theme text-xs min-w-0">
                <Store size={11} className="flex-shrink-0" />
                <span className="truncate">{product.vendor}</span>
              </div>

              <div
                className={`text-[11px] flex items-center gap-1 flex-shrink-0 ${
                  product.inStock ? "text-green-500" : "text-red-500"
                }`}
              >
                {product.inStock ? <Check size={11} /> : <X size={11} />}
                {product.inStock ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <Link href={`/product/${product.id}`}>
              <h3 className="mt-2 font-semibold text-base text-primary-theme hover:text-primary transition-all line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={
                      i < Math.round(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-border"
                    }
                  />
                ))}
              </div>
              <span className="text-muted-theme text-xs">
                ({product.reviews})
              </span>
            </div>
          </div>

          {/* PRICE + ACTION */}
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary-theme">
                  ₦{product.price.toLocaleString()}
                </span>

                {product.originalPrice && (
                  <span className="text-muted-theme text-xs line-through">
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {product.originalPrice && (
                <p className="text-green-500 text-[11px] mt-0.5">
                  Save{" "}
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  %
                </p>
              )}
            </div>

            {/* ADD TO CART */}
            <button
              disabled={!product.inStock}
              onClick={() => addToCart(toCartProduct(product))}
              className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                product.inStock
                  ? "bg-primary text-white hover:bg-primary-hover shadow-glow"
                  : "bg-surface-2 text-muted-theme cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

              {/* PAGINATION */}
              {totalPages > 1 && (
  <div className="flex justify-center mt-12">
    <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-2xl p-2">

      {/* PREV */}
      <button
        disabled={page === 1}
        onClick={() => {
          setPage((p) => Math.max(1, p - 1));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          page === 1
            ? "opacity-40 cursor-not-allowed text-muted-theme"
            : "hover:bg-surface text-primary-theme"
        }`}
      >
        ‹
      </button>

      {/* PAGES */}
      {Array.from({ length: totalPages })
        .slice(
          Math.max(0, page - 3),
          Math.min(totalPages, page + 2)
        )
        .map((_, i, arr) => {
          const pageNumber =
            Math.max(0, page - 3) + i + 1;

          return (
            <button
              key={pageNumber}
              onClick={() => {
                setPage(pageNumber);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-10 h-10 rounded-xl text-sm transition-all ${
                page === pageNumber
                  ? "bg-primary text-white shadow-glow"
                  : "bg-surface hover:bg-surface-2 text-muted-theme"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

      {/* NEXT */}
      <button
        disabled={page === totalPages}
        onClick={() => {
          setPage((p) => Math.min(totalPages, p + 1));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          page === totalPages
            ? "opacity-40 cursor-not-allowed text-muted-theme"
            : "hover:bg-surface text-primary-theme"
        }`}
      >
        ›
      </button>
    </div>
  </div>
)}
            </main>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}
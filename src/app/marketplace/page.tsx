"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "../layouts/AppShell";
import { products as allProducts, Product } from "../../data/product";

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
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Home",
  "Beauty",
  "Sports",
];

type CartItem = Product & {
  qty: number;
};

export default function MarketplacePage() {
  /* ================= STATE ================= */

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [minRating, setMinRating] = useState<number | null>(null);

  const [minPrice, setMinPrice] = useState<number | null>(null);

  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const [inStockOnly, setInStockOnly] = useState(false);

  const [sort, setSort] = useState("popular");

  const [wishlist, setWishlist] = useState<number[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);

  const PER_PAGE = 12;

  /* ================= LOAD CART ================= */

  useEffect(() => {
    const storedCart = localStorage.getItem("marketplace_cart");

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    const storedWishlist = localStorage.getItem(
      "marketplace_wishlist"
    );

    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  /* ================= SAVE CART ================= */

  useEffect(() => {
    localStorage.setItem(
      "marketplace_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "marketplace_wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  /* ================= HELPERS ================= */

  function toggleCategory(category: string) {
    setPage(1);

    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

  function toggleWishlist(id: number) {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    setCartOpen(true);
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
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

  /* ================= FILTERING ================= */

  const filtered = useMemo(() => {
    let data = [...allProducts];

    /* SEARCH */

    if (search) {
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.vendor.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    /* CATEGORY */

    if (selectedCategories.length > 0) {
      data = data.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    /* RATING */

    if (minRating) {
      data = data.filter((p) => p.rating >= minRating);
    }

    /* PRICE */

    if (minPrice !== null) {
      data = data.filter((p) => p.price >= minPrice);
    }

    if (maxPrice !== null) {
      data = data.filter((p) => p.price <= maxPrice);
    }

    /* STOCK */

    if (inStockOnly) {
      data = data.filter((p) => p.inStock);
    }

    /* SORT */

    if (sort === "price_low") {
      data.sort((a, b) => a.price - b.price);
    }

    if (sort === "price_high") {
      data.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      data.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "newest") {
      data.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (sort === "popular") {
      data.sort((a, b) => b.reviews - a.reviews);
    }

    return data;
  }, [
    search,
    selectedCategories,
    minRating,
    minPrice,
    maxPrice,
    inStockOnly,
    sort,
  ]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;

    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  /* ================= TOTAL ================= */

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <>
    <Navbar />
      <div className="bg-[#0B1120] min-h-screen text-white">

        {/* ================= CART DRAWER ================= */}

        {cartOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">

            <div className="w-full sm:w-[420px] bg-[#0F172A] h-full border-l border-white/10 flex flex-col">

              {/* HEADER */}

              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-xl font-bold">
                  Shopping Cart
                </h2>

                <button
                  onClick={() => setCartOpen(false)}
                  className="hover:text-orange-400"
                >
                  <X />
                </button>
              </div>

              {/* ITEMS */}

              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {cart.length === 0 ? (
                  <div className="text-center text-white/50 pt-20">
                    Cart is empty
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 border border-white/10 rounded-xl p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {item.name}
                        </h4>

                        <p className="text-white/50 text-xs mt-1">
                          Qty: {item.qty}
                        </p>

                        <p className="mt-2 font-bold text-orange-400">
                          ₦
                          {(
                            item.price * item.qty
                          ).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                        className="text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}

              </div>

              {/* FOOTER */}

              <div className="border-t border-white/10 p-5">

                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">
                    Total
                  </span>

                  <span className="font-bold text-xl">
                    ₦{cartTotal.toLocaleString()}
                  </span>
                </div>

                <Link href="/checkout">
                  <button className="w-full bg-orange-500 hover:bg-orange-600 transition-all py-3 rounded-xl font-semibold">
                    Proceed to Checkout
                  </button>
                </Link>

              </div>

            </div>

          </div>
        )}

        {/* ================= PAGE ================= */}

        <div className="p-6 space-y-8">

          {/* ================= HERO ================= */}

          <div className="bg-gradient-to-br from-[#111827] to-[#0F172A] border border-white/10 rounded-3xl p-8">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>
                <h1 className="text-4xl font-bold">
                  Discover Premium Products
                </h1>

                <p className="text-white/50 mt-3 max-w-2xl">
                  Shop from verified vendors across fashion,
                  electronics, beauty, sports and more.
                </p>
              </div>

              <button
                onClick={() => setCartOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 transition-all px-5 py-3 rounded-xl flex items-center gap-3 self-start"
              >
                <ShoppingCart size={18} />

                Cart ({cart.length})
              </button>

            </div>

            {/* SEARCH */}

            <div className="mt-8 max-w-2xl relative">

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, vendors or categories..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-orange-500"
              />

            </div>

          </div>

          {/* ================= BODY ================= */}

          <div className="flex flex-col lg:flex-row gap-8">

            {/* ================= SIDEBAR ================= */}

            <aside className="lg:w-72 space-y-5">

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">

                {/* TITLE */}

                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={18}
                    className="text-orange-400"
                  />

                  <h3 className="font-semibold">
                    Filters
                  </h3>
                </div>

                {/* CATEGORY */}

                <div>
                  <p className="text-sm text-white/60 mb-3">
                    Categories
                  </p>

                  <div className="space-y-3">

                    {CATEGORIES.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-3 text-sm text-white/70 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(
                            category
                          )}
                          onChange={() =>
                            toggleCategory(category)
                          }
                        />

                        {category}
                      </label>
                    ))}

                  </div>
                </div>

                {/* PRICE */}

                <div className="pt-5 border-t border-white/10">

                  <p className="text-sm text-white/60 mb-3">
                    Price Range
                  </p>

                  <div className="flex gap-3">

                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice ?? ""}
                      onChange={(e) =>
                        setMinPrice(
                          Number(e.target.value) || null
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                    />

                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice ?? ""}
                      onChange={(e) =>
                        setMaxPrice(
                          Number(e.target.value) || null
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                    />

                  </div>

                </div>

                {/* RATING */}

                <div className="pt-5 border-t border-white/10">

                  <p className="text-sm text-white/60 mb-3">
                    Minimum Rating
                  </p>

                  <div className="space-y-3">

                    {[5, 4, 3].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() =>
                            setMinRating(rating)
                          }
                        />

                        <div className="flex items-center gap-1 text-sm">
                          {[...Array(rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="fill-yellow-400 text-yellow-400"
                            />
                          ))}

                          <span className="ml-1 text-white/60">
                            & up
                          </span>
                        </div>
                      </label>
                    ))}

                  </div>

                </div>

                {/* STOCK */}

                <div className="pt-5 border-t border-white/10">

                  <label className="flex items-center gap-3 cursor-pointer text-sm text-white/70">

                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={() =>
                        setInStockOnly(!inStockOnly)
                      }
                    />

                    In Stock Only

                  </label>

                </div>

                {/* CLEAR */}

                <button
                  onClick={clearFilters}
                  className="w-full bg-white/5 hover:bg-white/10 transition-all py-3 rounded-xl text-sm"
                >
                  Clear Filters
                </button>

              </div>

              {/* BUYER PROTECTION */}

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6">

                <Shield className="mb-4" />

                <h3 className="font-bold text-lg">
                  Buyer Protection
                </h3>

                <p className="text-white/80 text-sm mt-2">
                  All purchases are protected with secure
                  checkout and verified vendor protection.
                </p>

              </div>

            </aside>

            {/* ================= PRODUCTS ================= */}

            <main className="flex-1">

              {/* TOPBAR */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                <p className="text-white/60 text-sm">
                  Showing{" "}
                  <span className="text-white font-semibold">
                    {filtered.length}
                  </span>{" "}
                  products
                </p>

                <div className="flex items-center gap-3">

                  {/* SORT */}

                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value)
                    }
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="popular">
                      Most Popular
                    </option>

                    <option value="price_low">
                      Price: Low → High
                    </option>

                    <option value="price_high">
                      Price: High → Low
                    </option>

                    <option value="rating">
                      Best Rating
                    </option>

                    <option value="newest">
                      Newest First
                    </option>
                  </select>

                  {/* VIEW */}

                  <div className="flex items-center border border-white/10 rounded-xl p-1">

                    <button
                      onClick={() =>
                        setViewMode("grid")
                      }
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "grid"
                          ? "bg-orange-500"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <Grid3x3 size={18} />
                    </button>

                    <button
                      onClick={() =>
                        setViewMode("list")
                      }
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "list"
                          ? "bg-orange-500"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <List size={18} />
                    </button>

                  </div>

                </div>

              </div>

              {/* ================= PRODUCTS GRID ================= */}

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
                    className={`group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 transition-all ${
                      viewMode === "list"
                        ? "flex gap-6"
                        : ""
                    }`}
                  >

                    {/* IMAGE */}

                    <Link
                      href={`/marketplace/${product.id}`}
                      className={
                        viewMode === "list"
                          ? "w-[280px] flex-shrink-0"
                          : ""
                      }
                    >

                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list"
                            ? "h-full"
                            : "aspect-square"
                        }`}
                      >

                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* TAG */}

                        {product.tag && (
                          <div className="absolute top-4 left-4">

                            <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">

                              {product.tag ===
                                "Trending" && (
                                <TrendingUp size={12} />
                              )}

                              {product.tag ===
                                "Fast Shipping" && (
                                <Zap size={12} />
                              )}

                              {product.tag}

                            </span>

                          </div>
                        )}

                        {/* WISHLIST */}

                        <button
                          onClick={() =>
                            toggleWishlist(product.id)
                          }
                          className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full"
                        >
                          <Heart
                            size={16}
                            className={
                              wishlist.includes(
                                product.id
                              )
                                ? "fill-red-500 text-red-500"
                                : "text-white"
                            }
                          />
                        </button>

                      </div>

                    </Link>

                    {/* CONTENT */}

                    <div
                      className={`p-5 flex flex-col justify-between ${
                        viewMode === "list"
                          ? "flex-1"
                          : ""
                      }`}
                    >

                      <div>

                        <div className="flex items-center justify-between">

                          <p className="text-xs text-white/40">
                            {product.vendor}
                          </p>

                          <div
                            className={`text-xs flex items-center gap-1 ${
                              product.inStock
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >

                            {product.inStock ? (
                              <Check size={14} />
                            ) : (
                              <X size={14} />
                            )}

                            {product.inStock
                              ? "In Stock"
                              : "Out of Stock"}

                          </div>

                        </div>

                        <Link
                          href={`/product/${product.id}`}
                        >
                          <h3 className="mt-3 font-semibold text-lg hover:text-orange-400 transition-all line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        {/* RATING */}

                        <div className="flex items-center gap-2 mt-3">

                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star
                              size={14}
                              className="fill-yellow-400"
                            />

                            <span className="text-sm">
                              {product.rating}
                            </span>
                          </div>

                          <span className="text-white/40 text-xs">
                            ({product.reviews} reviews)
                          </span>

                        </div>

                      </div>

                      {/* PRICE */}

                      <div className="mt-5">

                        <div className="flex items-end justify-between gap-3">

                          <div>

                            <div className="flex items-center gap-2">

                              <span className="text-2xl font-bold">
                                ₦
                                {product.price.toLocaleString()}
                              </span>

                              {product.originalPrice && (
                                <span className="text-white/40 text-sm line-through">
                                  ₦
                                  {product.originalPrice.toLocaleString()}
                                </span>
                              )}

                            </div>

                            {product.originalPrice && (
                              <p className="text-green-400 text-xs mt-1">

                                Save{" "}
                                {Math.round(
                                  ((product.originalPrice -
                                    product.price) /
                                    product.originalPrice) *
                                    100
                                )}
                                %

                              </p>
                            )}

                          </div>

                          {/* CART */}

                          <button
                            disabled={!product.inStock}
                            onClick={() =>
                              addToCart(product)
                            }
                            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                              product.inStock
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-gray-700 cursor-not-allowed"
                            }`}
                          >
                            <ShoppingCart size={18} />
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

              {/* ================= PAGINATION ================= */}

              <div className="flex justify-center mt-12">

                <div className="flex items-center gap-2">

                  {Array.from({
                    length: totalPages,
                  })
                    .slice(0, 6)
                    .map((_, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setPage(i + 1)
                        }
                        className={`w-11 h-11 rounded-xl transition-all ${
                          page === i + 1
                            ? "bg-orange-500"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                </div>

              </div>

            </main>

          </div>

        </div>

      </div>
    </>
  );
}
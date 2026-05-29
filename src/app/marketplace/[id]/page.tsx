"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  Store,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Package,
  Zap,
  Tag,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import CartDrawer from "../../components/Cart/cartDrawer";
import { useCart } from "../../context/Cartcontext";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface ProductData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  vendorId: string;
  category: string;
  tags: string[];
  images: string[];
  price: number;
  comparePrice?: number;
  currency: string;
  stock: number;
  inStock: boolean;
  weight?: number;
  rating: number;
  reviewsCount: number;
  featured: boolean;
  status: string;
  createdAt: string;
}

const VENDOR_NAMES: Record<string, string> = {
  "VENDOR-MOCK-001": "AutoBridge Vendor",
  vendor_pricepally_001: "PricePally",
};
function resolveVendor(id: string) {
  return VENDOR_NAMES[id] ?? id;
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white animate-pulse">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="h-5 w-48 bg-white/10 rounded-full" />
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="aspect-square bg-white/10 rounded-3xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/10 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 w-2/3 bg-white/10 rounded-full" />
            <div className="h-12 w-1/2 bg-white/10 rounded-full" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-white/10 rounded-full" />
              ))}
            </div>
            <div className="h-40 bg-white/10 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([]);

  /* ── CART CONTEXT ── */
  const {
    addToCart,
    cartCount,
    toggleWishlist,
    isWishlisted,
    openDrawer,
    buyNow,
  } = useCart();

  /* ── FETCH PRODUCT ── */
  useEffect(() => {
    if (!productId) return;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!data.success) {
          setError(data.message ?? "Product not found");
          return;
        }
        setProduct(data.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  /* ── FETCH RELATED ── */
  useEffect(() => {
    if (!product) return;
    async function loadRelated() {
      try {
        const res = await fetch(
          `/api/products?vendorId=${product!.vendorId}&category=${encodeURIComponent(product!.category)}`,
        );
        const data = await res.json();
        if (data.success) {
          setRelatedProducts(
            data.data
              .filter((p: ProductData) => p._id !== product!._id)
              .slice(0, 4),
          );
        }
      } catch (_) {}
    }
    loadRelated();
  }, [product]);

  /* ── LOADING / ERROR ── */
  if (loading)
    return (
      <>
        <Navbar />
        <Skeleton />
      </>
    );

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-4 text-white">
          <Package size={52} strokeWidth={1} className="text-white/20" />
          <p className="text-white/50 text-lg">
            {error ?? "Product not found"}
          </p>
          <Link
            href="/marketplace"
            className="text-orange-400 hover:underline text-sm flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Back to Marketplace
          </Link>
        </div>
      </>
    );
  }

  /* ── GALLERY ── */
  const gallery: string[] =
    product.images.length >= 4
      ? product.images.slice(0, 4)
      : [
          ...product.images,
          ...Array(4 - product.images.length).fill(
            product.images[0] ?? "/placeholder.png",
          ),
        ];

  /* ── HELPERS ── */
  function handleAddToCart() {
    if (!product!.inStock) return;
    addToCart({
      id: product!._id,
      name: product!.name,
      image: product!.images?.[0] ?? "/placeholder.png",
      vendor: resolveVendor(product!.vendorId),
      price: product!.price,
      inStock: product!.inStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const wishlisted = isWishlisted(product._id);
  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : null;
  const subtotal = quantity * product.price;
  const shipping = 2500;
  const total = subtotal + shipping;

  return (
    <>
      <Navbar />
      <CartDrawer />

      {/* ✅ FIX 1: min-h-screen now wraps ALL content, not just the sticky topbar */}
      <div className="min-h-screen bg-background text-primary-theme">

        {/* ── STICKY TOPBAR ── */}
        <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 text-muted-theme hover:text-[var(--primary)] transition-colors text-sm font-medium"
              >
                <ChevronLeft size={16} />
                Back
              </Link>

              <span className="hidden md:block text-[var(--border-strong)]">|</span>

              <span className="hidden md:block text-xs text-muted-theme">
                {product.category}
              </span>
            </div>

            {/* Cart icon opens drawer */}
            <button
              onClick={() => openDrawer("cart")}
              aria-label="Open cart"
              className="relative group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--primary-border)] hover:bg-[var(--primary-light)] transition-all duration-300">
                <ShoppingCart size={20} className="text-[var(--primary)]" />
              </div>

              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div className="max-w-7xl mx-auto p-6">

          {/* BREADCRUMB */}
          <div className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-muted-theme">
            <Link
              href="/marketplace"
              className="transition-colors hover:text-[var(--primary)]"
            >
              Marketplace
            </Link>

            <ChevronRight size={12} className="text-[var(--border-strong)]" />

            <span className="text-secondary-theme">{product.category}</span>

            <ChevronRight size={12} className="text-[var(--border-strong)]" />

            <span className="font-medium text-primary-theme">{product.name}</span>
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid lg:grid-cols-2 gap-12">

            {/* LEFT: GALLERY */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] group shadow-[var(--shadow-lg)]">
                <img
                  src={gallery[selectedImage]}
                  alt={product.name}
                  className="w-full h-[520px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* FEATURED */}
                {product.featured && (
                  <div className="absolute top-5 left-5 flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <Zap size={12} />
                    Featured
                  </div>
                )}

                {/* DISCOUNT */}
                {discount && (
                  <div className="absolute top-16 left-5 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    -{discount}% OFF
                  </div>
                )}

                {/* WISHLIST BUTTON */}
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all shadow-lg ${
                    wishlisted
                      ? "border-red-500 bg-red-500 text-white shadow-red-500/30"
                      : "border-[var(--border)] bg-black/30 text-white hover:border-[var(--border-strong)]"
                  }`}
                >
                  <Heart size={18} fill={wishlisted ? "white" : "none"} />
                </button>

                {/* GALLERY NAVIGATION */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((p) =>
                          p === 0 ? gallery.length - 1 : p - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-black/45 text-white backdrop-blur-md transition-all hover:bg-black/65"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <button
                      onClick={() =>
                        setSelectedImage((p) =>
                          p === gallery.length - 1 ? 0 : p + 1,
                        )
                      }
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-black/45 text-white backdrop-blur-md transition-all hover:bg-black/65"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* THUMBNAILS */}
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedImage === i
                        ? "border-[var(--primary)] shadow-lg shadow-orange-500/20"
                        : "border-transparent hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`view ${i + 1}`}
                      className="h-24 w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* TAGS */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs text-secondary-theme"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: INFO */}
            <div className="space-y-7">
              {/* BADGES */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--primary-border)] bg-[var(--primary-light)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
                  Verified Product
                </span>

                {product.inStock ? (
                  <span className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                    <Check size={11} />
                    In Stock ({product.stock} left)
                  </span>
                ) : (
                  <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                    Out of Stock
                  </span>
                )}

                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs text-muted-theme">
                  SKU: {product.sku}
                </span>
              </div>

              {/* PRODUCT TITLE */}
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-primary-theme">
                {product.name}
              </h1>

              {/* RATING + VENDOR */}
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-[var(--border-strong)]"
                        }
                      />
                    ))}
                  </div>

                  <span className="font-medium text-primary-theme">
                    {product.rating}
                  </span>

                  <span className="text-muted-theme">
                    ({product.reviewsCount} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-theme">
                  <Store size={14} />
                  <span>{resolveVendor(product.vendorId)}</span>
                </div>
              </div>

              {/* PRICE */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-1 shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl font-bold text-[var(--primary)]">
                    ₦{product.price.toLocaleString()}
                  </span>

                  {product.comparePrice && (
                    <span className="text-lg line-through text-muted-theme">
                      ₦{product.comparePrice.toLocaleString()}
                    </span>
                  )}

                  {discount && (
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-500">
                      Save {discount}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-theme">
                  Price in Nigerian Naira (₦) · Free shipping on orders over ₦20,000
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
                <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-secondary-theme">
                  About this product
                </h3>

                <p className="text-sm leading-relaxed text-secondary-theme">
                  {product.description}
                </p>
              </div>

              {/* QUANTITY */}
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[var(--shadow-sm)]">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-theme">
                    Quantity
                  </p>

                  <p className="mt-0.5 text-sm font-medium text-primary-theme">
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "None available"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] transition-all hover:border-[var(--primary-border)] hover:bg-[var(--primary-light)]"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-8 text-center text-xl font-bold text-primary-theme">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((p) => Math.min(product!.stock, p + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] transition-all hover:border-[var(--primary-border)] hover:bg-[var(--primary-light)] disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-theme">
                  Order Summary
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-theme">
                    <span>
                      Subtotal ({quantity} item{quantity > 1 ? "s" : ""})
                    </span>
                    <span className="text-primary-theme">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-theme">
                    <span>Delivery</span>
                    <span className="text-primary-theme">
                      ₦{shipping.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-[var(--border)] pt-4 text-lg font-bold">
                  <span className="text-primary-theme">Total</span>
                  <span className="text-[var(--primary)]">
                    ₦{total.toLocaleString()}
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-3 pt-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition-all active:scale-[0.98] ${
                      !product.inStock
                        ? "cursor-not-allowed bg-[var(--surface-2)] text-muted-theme"
                        : added
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                          : "bg-[var(--primary)] text-white hover:opacity-90 shadow-lg shadow-orange-500/20"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={18} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      buyNow(
                        {
                          id: product._id,
                          name: product.name,
                          image: product.images?.[0] ?? "/placeholder.png",
                          vendor: resolveVendor(product.vendorId),
                          price: product.price,
                          inStock: product.inStock,
                          weight: product.weight ?? 0.5,
                        },
                        quantity,
                      )
                    }
                    disabled={!product.inStock}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--primary-border)] bg-transparent py-3.5 font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CreditCard size={18} />
                    Buy Now
                  </button>
                </div>
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, title: "Fast Delivery", sub: "Nationwide" },
                  { icon: RotateCcw, title: "Easy Returns", sub: "7-day policy" },
                  { icon: ShieldCheck, title: "Buyer Protection", sub: "Safe & secure" },
                ].map(({ icon: Icon, title, sub }) => (
                  <div
                    key={title}
                    className="space-y-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center shadow-[var(--shadow-sm)]"
                  >
                    <Icon size={20} className="mx-auto text-[var(--primary)]" />
                    <p className="text-xs font-semibold text-primary-theme">{title}</p>
                    <p className="text-[11px] text-muted-theme">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* ✅ end lg:grid-cols-2 */}

          {/* ✅ FIX 2: Related products is now a SIBLING of the grid, not inside it */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-primary-theme">
                  More in {product.category}
                </h2>

                <Link
                  href={`/marketplace?category=${encodeURIComponent(product.category)}`}
                  className="text-orange-400 text-sm hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedProducts.map((item) => (
                  <Link
                    key={item._id}
                    href={`/marketplace/${item._id}`}
                    className="group rounded-3xl overflow-hidden bg-surface border border-[var(--border)] hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
                  >
                    <div className="overflow-hidden aspect-square bg-surface-secondary">
                      <img
                        src={item.images?.[0] ?? "/placeholder.png"}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-muted-theme text-xs">{item.category}</p>

                      <h3 className="font-semibold text-sm mt-1.5 line-clamp-2 group-hover:text-orange-400 transition leading-snug text-primary-theme">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-1 text-yellow-400 text-xs mt-2">
                        <Star size={11} fill="currentColor" />
                        <span className="text-primary-theme">{item.rating}</span>
                        <span className="text-muted-theme ml-0.5">
                          ({item.reviewsCount})
                        </span>
                      </div>

                      <p className="font-bold text-orange-400 mt-3">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>{/* end max-w-7xl */}

      </div>{/* ✅ end min-h-screen */}
      <Footer/>
    </>
  );
}
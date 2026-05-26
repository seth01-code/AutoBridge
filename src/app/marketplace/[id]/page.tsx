"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import AppShell from "../../layouts/AppShell";
import { products } from "../../../data/product";

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
} from "lucide-react";
import Navbar from "@/app/components/layout/Navbar";

type CartItem = {
  id: number;
  quantity: number;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = Number(params.id);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [added, setAdded] = useState(false);

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [productId],
  );

  /* ================= LOCAL STORAGE ================= */

  useEffect(() => {
    const storedCart = localStorage.getItem("commerce-cart");
    const storedWishlist = localStorage.getItem("commerce-wishlist");

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("commerce-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("commerce-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  if (!product) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center text-white">
          Product not found
        </div>
      </AppShell>
    );
  }

  /* ================= PRODUCT GALLERY ================= */

  const gallery = [product.image, product.image, product.image, product.image];

  /* ================= RELATED PRODUCTS ================= */

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  /* ================= CART ================= */

  function addToCart() {
    if (!product.inStock) return;

    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          quantity,
        },
      ];
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  function toggleWishlist() {
    setWishlist((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id],
    );
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isWishlisted = wishlist.includes(product.id);

  /* ================= CHECKOUT ================= */

  const subtotal = quantity * product.price;
  const shipping = 2500;
  const total = subtotal + shipping;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0B1120] text-white">
        {/* TOP BAR */}
        <div className="border-b border-white/10 bg-[#0F172A] sticky top-0 z-30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-white/60 hover:text-orange-400 transition"
              >
                <ChevronLeft size={18} />
                Back
              </Link>

              <div className="hidden md:block text-sm text-white/40">
                {product.category}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/checkout" className="relative">
                <ShoppingCart className="text-orange-400" />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* BREADCRUMB */}
          <div className="mb-8 text-sm text-white/50 flex flex-wrap gap-2">
            <Link href="/marketplace" className="hover:text-orange-400">
              Marketplace
            </Link>

            <span>/</span>

            <span>{product.category}</span>

            <span>/</span>

            <span className="text-white">{product.name}</span>
          </div>

          {/* MAIN */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* LEFT */}
            <div className="space-y-4">
              {/* MAIN IMAGE */}
              <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <Image
                  src={gallery[selectedImage]}
                  alt={product.name}
                  width={1000}
                  height={1000}
                  className="w-full h-[600px] object-cover"
                />

                {product.tag && (
                  <div className="absolute top-5 left-5 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {product.tag}
                  </div>
                )}

                <button
                  onClick={toggleWishlist}
                  className={`absolute top-5 right-5 w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all ${
                    isWishlisted
                      ? "bg-red-500 border-red-500"
                      : "bg-black/40 border-white/10"
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? "white" : "none"} />
                </button>
              </div>

              {/* THUMBNAILS */}
              <div className="grid grid-cols-4 gap-4">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`rounded-2xl overflow-hidden border transition-all ${
                      selectedImage === i
                        ? "border-orange-500"
                        : "border-white/10"
                    }`}
                  >
                    <Image
                      src={img}
                      alt="preview"
                      width={300}
                      height={300}
                      className="h-28 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              {/* TITLE */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm">
                    Verified Product
                  </div>

                  {product.inStock ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">
                      In Stock
                    </div>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm">
                      Out of Stock
                    </div>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-6 mt-5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Star
                      size={18}
                      className="text-yellow-400 fill-yellow-400"
                    />

                    <span className="font-medium">{product.rating}</span>

                    <span className="text-white/40">
                      ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-white/50">
                    <Store size={16} />
                    {product.vendor}
                  </div>
                </div>
              </div>

              {/* PRICE */}
              <div className="space-y-2">
                <div className="text-5xl font-bold text-orange-400">
                  ₦{product.price.toLocaleString()}
                </div>

                {product.originalPrice && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="line-through text-white/40 text-xl">
                      ₦{product.originalPrice.toLocaleString()}
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      Save{" "}
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                      )}
                      %
                    </div>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h3 className="font-semibold text-lg mb-4">Description</h3>

                <p className="text-white/60 leading-relaxed">
                  This premium {product.category.toLowerCase()} product is
                  designed for modern commerce experiences. Carefully sourced
                  from verified vendors and protected by our buyer guarantee
                  system. Enjoy secure payments, nationwide delivery, and
                  trusted support.
                </p>
              </div>

              {/* QUANTITY */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5">
                <div>
                  <p className="text-white/40 text-sm">Quantity</p>

                  <p className="font-medium">Select quantity</p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                    }
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-orange-500 transition"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="text-2xl font-bold w-10 text-center">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-orange-500 transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* CHECKOUT BOX */}
              <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Subtotal</span>

                  <span>₦{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/50">Shipping</span>

                  <span>₦{shipping.toLocaleString()}</span>
                </div>

                <div className="border-t border-white/10 pt-5 flex items-center justify-between text-xl font-bold">
                  <span>Total</span>

                  <span className="text-orange-400">
                    ₦{total.toLocaleString()}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="space-y-3">
                  <button
                    onClick={addToCart}
                    disabled={!product.inStock}
                    className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all ${
                      product.inStock
                        ? added
                          ? "bg-green-500"
                          : "bg-orange-500 hover:bg-orange-600"
                        : "bg-gray-700 cursor-not-allowed"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={20} />
                        Added To Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add To Cart
                      </>
                    )}
                  </button>

                  <button className="w-full py-4 rounded-2xl border border-orange-500 text-orange-400 font-semibold hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    <CreditCard size={18} />
                    Buy Now
                  </button>
                </div>
              </div>

              {/* FEATURES */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <Truck className="text-orange-400 mb-3" />

                  <h4 className="font-medium">Fast Delivery</h4>

                  <p className="text-sm text-white/50 mt-1">
                    Nationwide shipping
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <RotateCcw className="text-orange-400 mb-3" />

                  <h4 className="font-medium">Easy Returns</h4>

                  <p className="text-sm text-white/50 mt-1">
                    7-day return policy
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <ShieldCheck className="text-orange-400 mb-3" />

                  <h4 className="font-medium">Buyer Protection</h4>

                  <p className="text-sm text-white/50 mt-1">
                    Safe transactions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">Related Products</h2>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ChevronLeft size={18} />
                </button>

                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.id}`}
                  className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all"
                >
                  <div className="overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={500}
                      height={500}
                      className="h-60 w-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-white/40 text-xs">{item.category}</p>

                    <h3 className="font-semibold mt-2 line-clamp-2 group-hover:text-orange-400 transition">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-1 text-yellow-400 text-sm mt-3">
                      <Star size={14} fill="currentColor" />

                      {item.rating}
                    </div>

                    <div className="font-bold text-orange-400 mt-4 text-lg">
                      ₦{item.price.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

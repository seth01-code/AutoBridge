"use client";

import Link from "next/link";
import {
  X,
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useCart, CartProduct } from "../../context/Cartcontext";

interface CartDrawerProps {
  allProducts?: CartProduct[];
}

export default function CartDrawer({ allProducts = [] }: CartDrawerProps) {
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQty,
    clearCart,
    cartLoading,
    wishlist,
    toggleWishlist,
    addToCart,
    drawerOpen,
    drawerTab,
    setDrawerTab,
    closeDrawer,
    proceedToCheckout, // ← wired
  } = useCart();

  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));

  if (!drawerOpen) return null;

  return (
    <div
  className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
  onClick={(e) => {
    if (e.target === e.currentTarget) closeDrawer();
  }}
>
  <div
    className="w-full sm:w-[440px] h-full flex flex-col shadow-2xl"
    style={{
      background: "var(--surface)",
      borderLeft: "1px solid var(--border)",
      color: "var(--text-primary)",
    }}
  >
    {/* ── HEADER ── */}
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <div
        className="flex gap-1 rounded-2xl p-1"
        style={{ background: "var(--surface-2)" }}
      >
        {(["cart", "wishlist"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setDrawerTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              drawerTab === tab
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            {tab === "cart" ? (
              <>
                <ShoppingBag size={14} />
                Cart {cartCount > 0 && `(${cartCount})`}
              </>
            ) : (
              <>
                <Heart size={14} />
                Saved {wishlist.length > 0 && `(${wishlist.length})`}
              </>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={closeDrawer}
        className="p-2 rounded-xl transition-all"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--surface-2)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
        <X size={20} />
      </button>
    </div>

    {/* ══════════ CART TAB ══════════ */}
    {drawerTab === "cart" && (
      <>
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
          {cartLoading ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-3 pt-20"
              style={{ color: "var(--text-muted)" }}
            >
              <Loader2 size={36} className="animate-spin text-orange-400" />
              <p className="text-sm">Loading your cart…</p>
            </div>
          ) : cart.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-4 pt-20"
              style={{ color: "var(--text-muted)" }}
            >
              <ShoppingBag size={56} strokeWidth={1} />
              <p className="text-base">Your cart is empty</p>
              <button
                onClick={closeDrawer}
                className="text-orange-400 text-sm hover:underline"
              >
                Keep browsing
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl p-3"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p style={{ color: "var(--text-muted)" }} className="text-xs">
                    {item.vendor}
                  </p>

                  <h4
                    style={{ color: "var(--text-primary)" }}
                    className="font-semibold text-sm line-clamp-2"
                  >
                    {item.name}
                  </h4>

                  <p className="mt-2 text-sm font-bold text-orange-400">
                    ₦{(item.price * item.qty).toLocaleString()}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: "var(--surface)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <Minus size={12} />
                    </button>

                    <span
                      className="text-sm font-medium w-4 text-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.qty}
                    </span>

                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: "var(--surface)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <Plus size={12} />
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto transition-all"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {!cartLoading && cart.length > 0 && (
          <div
            className="px-6 pb-6 pt-4 space-y-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                Subtotal ({cartCount} items)
              </span>
              <span style={{ color: "var(--text-primary)" }} className="font-semibold">
                ₦{cartTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={proceedToCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              Checkout <ChevronRight size={16} />
            </button>

            <button
              onClick={clearCart}
              className="w-full text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Clear cart
            </button>
          </div>
        )}
      </>
    )}

    {/* ══════════ WISHLIST TAB ══════════ */}
    {drawerTab === "wishlist" && (
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
        {wishlistProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-4 pt-20"
            style={{ color: "var(--text-muted)" }}
          >
            <Heart size={56} strokeWidth={1} />
            <p className="text-base">Nothing saved yet</p>
            <button
              onClick={closeDrawer}
              className="text-orange-400 text-sm hover:underline"
            >
              Browse products
            </button>
          </div>
        ) : (
          wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="flex gap-4 rounded-2xl p-3"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={product.image}
                className="w-20 h-20 rounded-xl object-cover"
              />

              <div className="flex-1 min-w-0">
                <p style={{ color: "var(--text-muted)" }} className="text-xs">
                  {product.vendor}
                </p>

                <h4
                  style={{ color: "var(--text-primary)" }}
                  className="font-semibold text-sm"
                >
                  {product.name}
                </h4>

                <p className="text-orange-400 font-bold text-sm mt-1">
                  ₦{product.price.toLocaleString()}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      addToCart(product);
                      setDrawerTab("cart");
                    }}
                    className="flex-1 py-1.5 rounded-xl text-xs font-medium bg-orange-500 text-white"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-1.5 rounded-xl"
                    style={{
                      background: "var(--surface)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )}
  </div>
</div>
  );
}
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../../lib/auth";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
export interface CartProduct {
  id: string;
  name: string;
  image: string;
  vendor: string;
  price: number;
  inStock: boolean;
  weight?: number; // kg — forwarded to DHL rate calc
}

export type CartItem = CartProduct & { qty: number };
export type DrawerTab = "cart" | "wishlist";

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  cartLoading: boolean;

  /** Navigate to /checkout pre-loaded with the full cart */
  proceedToCheckout: () => void;

  /**
   * "Buy Now" — writes a single item to the checkout
   * localStorage key and navigates to /checkout immediately.
   * Does NOT touch the user's real cart.
   */
  buyNow: (product: CartProduct, quantity?: number) => void;

  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;

  drawerOpen: boolean;
  drawerTab: DrawerTab;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
  setDrawerTab: (tab: DrawerTab) => void;
}

/* ─────────────────────────────────────────────
   CHECKOUT LOCALSTORAGE KEY
   Shared between CartContext and CheckoutPage.
───────────────────────────────────────────── */
export const CHECKOUT_STORAGE_KEY = "autobridge_checkout_items";

/* ─────────────────────────────────────────────
   BACKEND → FRONTEND MAPPER
───────────────────────────────────────────── */
function backendItemToCartItem(item: any): CartItem {
  return {
    id:       item.productId.toString(),
    name:     item.name ?? "",
    image:    item.image ?? "",
    vendor:   item.vendor ?? "",
    price:    item.price ?? 0,
    inStock:  true,
    weight:   item.weight ?? 0.5,
    qty:      item.quantity ?? 1,
  };
}

/* ─────────────────────────────────────────────
   API HELPERS
───────────────────────────────────────────── */
async function apiFetchCart(userId: string): Promise<CartItem[]> {
  const res  = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return (json.data?.items ?? []).map(backendItemToCartItem);
}

async function apiAddItem(userId: string, product: CartProduct): Promise<CartItem[]> {
  const res = await fetch("/api/cart", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      productId: product.id,
      name:      product.name,
      image:     product.image,
      vendor:    product.vendor,
      price:     product.price,
      weight:    product.weight ?? 0.5,
      quantity:  1,
    }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return (json.data?.items ?? []).map(backendItemToCartItem);
}

async function apiUpdateQty(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
  const res = await fetch(`/api/cart/${productId}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, quantity }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return (json.data?.items ?? []).map(backendItemToCartItem);
}

async function apiRemoveItem(userId: string, productId: string): Promise<CartItem[]> {
  const res = await fetch(
    `/api/cart/${productId}?userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return (json.data?.items ?? []).map(backendItemToCartItem);
}

/* ─────────────────────────────────────────────
   CONTEXT
───────────────────────────────────────────── */
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [cart, setCart]               = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlist, setWishlist]       = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [drawerTab, setDrawerTab]     = useState<DrawerTab>("cart");

  /* ── GET CURRENT USER ID ── */
  const getUserId = useCallback((): string | null => {
    const user = getUser();
    return user?.id ?? null;
  }, []);

  /* ── LOAD CART FROM BACKEND ON MOUNT ── */
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    setCartLoading(true);
    apiFetchCart(userId)
      .then(setCart)
      .catch((err) => console.error("[CartContext] fetch cart:", err))
      .finally(() => setCartLoading(false));
  }, [getUserId]);

  /* ── WISHLIST: localStorage only ── */
  useEffect(() => {
    try {
      const w = localStorage.getItem("marketplace_wishlist");
      if (w) setWishlist(JSON.parse(w));
    } catch (_) {}
  }, []);

  useEffect(() => {
    localStorage.setItem("marketplace_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  /* ── Broadcast cart change (e.g. Navbar badge) ── */
  useEffect(() => {
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  /* ── CART ACTIONS ── */
  const addToCart = useCallback(
    async (product: CartProduct) => {
      const userId = getUserId();
      if (!userId) {
        console.warn("[CartContext] addToCart: no user logged in");
        return;
      }

      // Optimistic update
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing)
          return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
        return [...prev, { ...product, qty: 1 }];
      });
      setDrawerTab("cart");
      setDrawerOpen(true);

      try {
        const updated = await apiAddItem(userId, product);
        setCart(updated);
      } catch (err) {
        console.error("[CartContext] addToCart API failed:", err);
        setCart((prev) => {
          const item = prev.find((i) => i.id === product.id);
          if (!item) return prev;
          if (item.qty === 1) return prev.filter((i) => i.id !== product.id);
          return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty - 1 } : i);
        });
      }
    },
    [getUserId],
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      const userId = getUserId();
      if (!userId) return;
      const previous = cart;
      setCart((prev) => prev.filter((i) => i.id !== id));
      try {
        const updated = await apiRemoveItem(userId, id);
        setCart(updated);
      } catch (err) {
        console.error("[CartContext] removeFromCart API failed:", err);
        setCart(previous);
      }
    },
    [getUserId, cart],
  );

  const updateQty = useCallback(
    async (id: string, delta: number) => {
      const userId = getUserId();
      if (!userId) return;
      const item = cart.find((i) => i.id === id);
      if (!item) return;
      const newQty = Math.max(1, item.qty + delta);
      setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: newQty } : i));
      try {
        const updated = await apiUpdateQty(userId, id, newQty);
        setCart(updated);
      } catch (err) {
        console.error("[CartContext] updateQty API failed:", err);
        setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: item.qty } : i));
      }
    },
    [getUserId, cart],
  );

  const clearCart = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    const previous = cart;
    setCart([]);
    try {
      await Promise.all(cart.map((item) => apiRemoveItem(userId, item.id)));
    } catch (err) {
      console.error("[CartContext] clearCart failed:", err);
      setCart(previous);
    }
  }, [getUserId, cart]);

  /* ─────────────────────────────────────────
     CHECKOUT NAVIGATION HELPERS
  ───────────────────────────────────────── */

  /**
   * Writes the current cart to localStorage in the shape
   * CheckoutPage expects, then navigates to /checkout.
   * Called from CartDrawer's "Checkout" button.
   */
  const proceedToCheckout = useCallback(() => {
    const checkoutItems = cart.map((item) => ({
      productId: item.id,
      name:      item.name,
      image:     item.image,
      vendor:    item.vendor,
      price:     item.price,
      quantity:  item.qty,
      weight:    item.weight ?? 0.5,
    }));
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutItems));
    setDrawerOpen(false);
    router.push("/checkout");
  }, [cart, router]);

  /**
   * "Buy Now" — does NOT modify the user's saved cart.
   * Writes a single item (with `quantity`) to the checkout
   * localStorage key and navigates immediately to /checkout.
   */
  const buyNow = useCallback(
    (product: CartProduct, quantity = 1) => {
      const checkoutItems = [
        {
          productId: product.id,
          name:      product.name,
          image:     product.image,
          vendor:    product.vendor,
          price:     product.price,
          quantity,
          weight:    product.weight ?? 0.5,
        },
      ];
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutItems));
      router.push("/checkout");
    },
    [router],
  );

  /* ── WISHLIST ── */
  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist],
  );

  /* ── DRAWER ── */
  const openDrawer  = useCallback((tab: DrawerTab = "cart") => {
    setDrawerTab(tab);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  /* ── DERIVED ── */
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartLoading,
        proceedToCheckout,
        buyNow,
        wishlist,
        toggleWishlist,
        isWishlisted,
        drawerOpen,
        drawerTab,
        openDrawer,
        closeDrawer,
        setDrawerTab,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
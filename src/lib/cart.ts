export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

const KEY = "autobridge_cart";

/* ================= GET CART ================= */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

/* ================= SAVE CART ================= */
export function saveCart(cart: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

/* ================= ADD ITEM ================= */
export function addToCart(item: CartItem) {
  const cart = getCart();

  const existing = cart.find((i) => i.id === item.id);

  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

/* ================= CART COUNT ================= */
export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
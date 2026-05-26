"use client";

import { useEffect, useState } from "react";
import { Product } from "../data/product";

export type CartItem = Product & { qty: number };

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  /* LOAD FROM LOCALSTORAGE */
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  /* SAVE TO LOCALSTORAGE */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    clearCart,
    total,
  };
}

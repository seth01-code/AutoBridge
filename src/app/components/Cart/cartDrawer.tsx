"use client";

import { X } from "lucide-react";
import { useCart } from "../../../hooks/useCarts";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, total } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
      <div className="w-[400px] bg-white h-full p-6 flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto mt-6 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 border-b pb-3">
              <img
                src={item.image}
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex-1">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.qty}
                </p>
                <p className="text-sm font-bold">
                  ₦{(item.price * item.qty).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <button className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
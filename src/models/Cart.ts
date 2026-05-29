import mongoose, { Schema, models, model } from "mongoose";

const CartItemSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    image: String,
    vendor: String,      // ← added so vendor survives the round-trip
    price: Number,
    quantity: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
  }
);

const Cart = models.Cart || model("Cart", CartSchema);

export default Cart;
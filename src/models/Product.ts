import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    vendorId: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    comparePrice: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    dimensions: {
      length: {
        type: Number,
        default: 0,
      },

      width: {
        type: Number,
        default: 0,
      },

      height: {
        type: Number,
        default: 0,
      },
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "published",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    seoTitle: {
      type: String,
    },

    seoDescription: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  models.Product || model("Product", ProductSchema);

export default Product;
import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    name:      { type: String, required: true },
    image:     { type: String, default: "" },
    vendor:    { type: String, default: "" },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    weight:    { type: Number, default: 0.5 },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    fullName:   { type: String, required: true },
    email:      { type: String, required: true },
    phone:      { type: String, required: true },
    country:    { type: String, required: true },
    state:      { type: String, default: "" },
    city:       { type: String, required: true },
    address:    { type: String, required: true },
    postalCode: { type: String, default: "" },
    landmark:   { type: String, default: "" },
  },
  { _id: false }
);

const ShippingSchema = new Schema(
  {
    rateId:         { type: String, required: true },
    carrier:        { type: String, required: true },
    name:           { type: String, required: true },
    price:          { type: Number, required: true },
    eta:            { type: String, default: "" },
    dhlProductCode: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    labelUrl:       { type: String, default: "" },
    shippedAt:      { type: Date },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId:        { type: String, required: true, index: true },
    orderNumber:   { type: String, unique: true },
    items:         { type: [OrderItemSchema], required: true },
    address:       { type: AddressSchema,    required: true },
    shipping:      { type: ShippingSchema,   required: true },
    subtotal:      { type: Number, required: true },
    shippingCost:  { type: Number, required: true },
    discount:      { type: Number, default: 0 },
    total:         { type: Number, required: true },
    currency:      { type: String, default: "NGN" },
    promoCode:     { type: String, default: "" },
    paymentMethod: { type: String, default: "paystack" },
    paystackRef:   { type: String, default: "", index: true },
    paystackStatus:{ type: String, default: "pending" },
    status: {
      type: String,
      enum: ["pending_payment","paid","processing","shipped","delivered","cancelled","refunded"],
      default: "pending_payment",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ status: 1, createdAt: -1 });

// No pre-save hook — orderNumber is generated in the API route
// before calling Order.create(), which avoids all hook timing issues.

// To this — forces re-registration on hot reload:
if (models.Order) {
  delete (mongoose.connection as any).models?.Order;
  delete models.Order;
}
const Order = model("Order", OrderSchema);
export default Order;

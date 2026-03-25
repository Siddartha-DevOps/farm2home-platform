const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "net_banking", "cash_on_delivery"],
      default: "cash_on_delivery"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    trackingNumber: {
      type: String,
      default: null
    },
    estimatedDelivery: {
      type: Date,
      default: null
    },
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // If customer is a user or even guest customer can allowed
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Customer Delivery Details
    customerDetails: {
      name: { type: String, required: [true, "Customer name is required"] },
      phone: { type: String, required: [true, "Contact number is required"] },
      address: { type: String, required: [true, "Shipping address is required"] },
      district: { type: String, required: true }, // e.g., "Feni", "Dhaka"
    },
    // Product or Cart List
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, default: 1 },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    // Total Calculation
    totalAmount: { type: Number, required: true },
    // Current Status of Order
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    // Future Paymnet Integration
    paymentDetails: {
      method: { type: String, enum: ["cod", "bkash", "undecided"], default: "undecided" },
      status: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
      bkashMsisdn: { type: String, default: "" },
      transactionId: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
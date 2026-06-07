const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Amount must be at least 1 Taka"],
    },
    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["bkash", "nagad", "rocket", "bank"],
    },
    campaignSlug: {
      type: String,
      required: true,
      default: "general",
    },
    senderNumber: {
      type: String,
      trim: true,
      required: function () {
        return this.method !== "bank";
      },
    },
    trxId: {
      type: String,
      trim: true,
      sparse: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate transaction IDs for mobile wallet operations
donationSchema.index(
  { trxId: 1 },
  { unique: true, partialFilterExpression: { trxId: { $type: "string" } } }
);

module.exports = mongoose.model("Donation", donationSchema);
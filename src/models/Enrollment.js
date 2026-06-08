const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
    paymentDetails: {
      method: {
        type: String,
        required: [true, "Payment method selection is required"],
        trim: true,
      },
      senderName: {
        type: String,
        required: [true, "Sender name is required"],
        trim: true,
      },
      bkashNumber: {
        type: String,
        required: [true, "Account number is required"],
        trim: true,
      },
      transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
        trim: true,
      },
      amountPaid: {
        type: Number,
        required: [true, "Paid amount value is required"],
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
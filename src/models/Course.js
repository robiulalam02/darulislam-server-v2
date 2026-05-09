const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a course title"],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Please add a thumbnail image URL"],
    },
    category: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    price: {
      type: Number,
      default: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "0 hours",
    },
    courseType: {
      type: String,
      required: [true, "Please specify course type"],
      default: "Online",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    details: {
      fullTitle: { type: String },
      description: { type: String },
      admissionFee: { type: Number, default: 0 },
      oldAdmissionFee: { type: Number, default: 0 },
      monthlyFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      coupon: { type: String },
      batchInfo: { type: String },
      highlights: [
        {
          label: { type: String },
          value: { type: String },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Course", courseSchema);

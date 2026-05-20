const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Notice description content is required"],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Target course reference is required"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor authorization reference is required"],
    },
    type: {
      type: String,
      enum: ["urgent", "important", "general"],
      default: "general",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notice", noticeSchema);
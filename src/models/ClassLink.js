const mongoose = require("mongoose");

const classLinkSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "কোর্স সিলেক্ট করা বাধ্যতামূলক"],
    },
    classTitle: {
      type: String,
      required: [true, "ক্লাসের নাম বা টপিক দেওয়া বাধ্যতামূলক"],
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    link: {
      type: String,
      required: [true, "ক্লাস লিঙ্ক দেওয়া বাধ্যতামূলক"],
      trim: true,
    },
    classDate: {
      type: Date,
      required: [true, "ক্লাসের তারিখ দেওয়া বাধ্যতামূলক"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    // Auto delete if date expires
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ClassLink", classLinkSchema);

const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Gallery image title is required"],
      trim: true,
    },
    image: [
      {
        type: String,
        required: [true, "At least one image asset URL is required"],
      },
    ],
    event: {
      type: String,
      required: [true, "Event category or tag is required"],
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Gallery", gallerySchema);

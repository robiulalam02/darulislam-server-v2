const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
    inStock: { type: Boolean, default: true },
    details: {
      description: { type: String },
      publisher: { type: String },
      features: [{ type: String }],
      rating: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);

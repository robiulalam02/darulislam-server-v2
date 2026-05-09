const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getShopData,
} = require("../controllers/productController");
const { protect, admin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Get product data for shop page
router.get("/shop", getShopData);

router
  .route("/")
  .get(protect, admin, getAllProducts)
  .post(protect, admin, upload.single("image"), createProduct);

router
  .route("/:id")
  .put(protect, admin, upload.single("image"), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategoryFeatured,
  deleteCategory,
  getCategoryByIdOrSlug,
} = require("../controllers/categoryController");
const upload = require("../middlewares/uploadMiddleware");
const { protect, admin } = require("../middlewares/authMiddleware");

router.get("/", getCategories);
router.get("/:idOrSlug", getCategoryByIdOrSlug);

router.post("/", protect, admin, upload.single("image"), createCategory);
router.put("/:id", protect, admin, upload.single("image"), updateCategory);
router.patch("/featured/:id", protect, admin, toggleCategoryFeatured);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
} = require("../controllers/batchController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public Routes
router.get("/", protect, getAllBatches);
router.get("/:id", protect, getBatchById);

// Admin Routes
router.post("/", protect, admin, createBatch);
router.put("/:id", protect, admin, updateBatch);
router.delete("/:id", protect, admin, deleteBatch);

module.exports = router;
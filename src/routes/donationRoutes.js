const express = require("express");
const router = express.Router();
const {
  createDonation,
  getDonationLogs,
  approveDonation,
  rejectDonation,
} = require("../controllers/donationController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public routes
router.post("/", createDonation);

// Admin Routes
router.get("/admin/all", protect, admin, getDonationLogs);
router.put("/admin/approve/:id", protect, admin, approveDonation);
router.put("/admin/reject/:id", protect, admin, rejectDonation);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  createEnrollmentRequest,
  getEnrollmentLogs,
  approveEnrollment,
} = require("../controllers/enrollmentController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Student Operations
router.post("/enroll-course", protect, createEnrollmentRequest);

// Admin dashboard routes
router.get("/admin/all", protect, admin, getEnrollmentLogs);
router.put("/admin/approve/:id", protect, admin, approveEnrollment);

module.exports = router;
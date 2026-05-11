const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  approveTeacher,
} = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

// অ্যাডমিন ইউজার ম্যানেজমেন্ট রাউটস
router.get("/admin/all-users", protect, admin, getAllUsers);
router.put("/admin/update-role/:id", protect, admin, updateUserRole);
router.put("/admin/approve-teacher/:id", protect, admin, approveTeacher);

module.exports = router;
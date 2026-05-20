const express = require("express");
const router = express.Router();
const {
  createNotice,
  updateNotice,
  getInstructorNotices,
  getStudentNotices,
  deleteNotice,
} = require("../controllers/noticeController");
const { protect, instructor } = require("../middlewares/authMiddleware");

// --- Teacher Routes ---
router.post("/teacher/add-notice", protect, instructor, createNotice);
router.get("/teacher/my-notices", protect, instructor, getInstructorNotices);
router.put("/teacher/:id", protect, instructor, updateNotice);
router.delete("/teacher/delete-notice/:id", protect, instructor, deleteNotice);

// --- Student Routes ---
router.get("/student/my-notices", protect, getStudentNotices);

module.exports = router;
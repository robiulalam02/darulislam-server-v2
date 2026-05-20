const express = require("express");
const router = express.Router();
const {
  createClassLink,
  getClassLinks,
  updateClassLink,
  getStudentClassLinks,
  deleteClassLink,
} = require("../controllers/classLinkController");
const { protect, instructor } = require("../middlewares/authMiddleware");

router.get("/teacher/my-links", protect, instructor, getClassLinks);

// CRUD Routes for Instructors
router.post("/teacher/add-link", protect, instructor, createClassLink);
router.put("/teacher/update-link/:id", protect, instructor, updateClassLink);

// DELETE Class Link
router.delete("/teacher/delete-link/:id", protect, instructor, deleteClassLink);

// --- Student Routes ---
router.get("/student/my-links", protect, getStudentClassLinks);

module.exports = router;
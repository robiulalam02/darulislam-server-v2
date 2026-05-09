const express = require("express");
const router = express.Router();
const {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  getTeacherCourses,
  getEducationPageData,
} = require("../controllers/courseController");
const { protect, instructor } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware');

// Public route to get courses
router.get("/", getCourses);

// Get courses y categories for education page
router.get("/education", getEducationPageData);

// Dashboard Route (MUST BE ABOVE /:id)
router.get("/my-courses", protect, instructor, getTeacherCourses);

// CRUD Routes for Instructors
router.post("/", protect, instructor, upload.single('thumbnail'), createCourse);
router.put("/:id", protect, instructor, updateCourse);
router.delete("/:id", protect, instructor, deleteCourse);

module.exports = router;
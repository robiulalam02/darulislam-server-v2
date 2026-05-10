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
// Get courses by categories for education page
router.get("/education", getEducationPageData);
// Dashboard Route (MUST BE ABOVE /:id)
router.get("/teacher/my-courses", protect, instructor, getTeacherCourses);

// CRUD Routes for Instructors
router.post("/teacher/add-course", protect, instructor, upload.single('image'), createCourse);
router.put("/teacher/:id", protect, instructor, upload.single('image'), updateCourse);

// DELETE Course
router.delete("/teacher/delete-course/:id", protect, instructor, deleteCourse);

module.exports = router;
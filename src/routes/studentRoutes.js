const express = require("express");
const router = express.Router();
const {
  getPublicStudents,
  toggleStudentFeatured,
  getEnrolledCourses,
} = require("../controllers/studentController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.get("/", getPublicStudents);

router.get("/my-courses", protect, getEnrolledCourses);

router.patch("/featured/:id", protect, admin, toggleStudentFeatured);

module.exports = router;

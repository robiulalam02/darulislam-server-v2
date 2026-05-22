const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getInstructorSubmissions,
  evaluateSubmission,
  getEvaluationStats,
  getStudentAssignments,
  submitAssignment,
  getStudentResults,
} = require("../controllers/assignmentController");
const { protect, instructor } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware"); // Assuming multi-file image uploader is ready

// Instructor Management Nodes
router.post("/teacher/create", protect, instructor, createAssignment);
router.get("/teacher/stats", protect, instructor, getEvaluationStats);
router.get("/teacher/submissions", protect, instructor, getInstructorSubmissions);
router.patch("/teacher/evaluate/:submissionId", protect, instructor, evaluateSubmission);

// Student Pipeline Nodes
router.get("/student/feed", protect, getStudentAssignments);
router.post("/student/submit", protect, upload.array("submittedImages", 10), submitAssignment);
router.get("/student/results", protect, getStudentResults);

module.exports = router;
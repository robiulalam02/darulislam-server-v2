const express = require('express');
const router = express.Router();
const { createCourse, getCourses, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public route to get courses
router.get('/', getCourses);

// Admin route to create a course
router.post('/', protect, admin, createCourse);

// Update & Delete a course
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

module.exports = router;
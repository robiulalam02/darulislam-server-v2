const express = require('express');
const router = express.Router();
const { createCourse, getCourses, updateCourse, deleteCourse, getTeacherCourses } = require('../controllers/courseController');
const { protect, instructor } = require('../middlewares/authMiddleware');

// Public route to get courses
router.get('/', getCourses);

// Dashboard Route (MUST BE ABOVE /:id)
router.get('/my-courses', protect, instructor, getTeacherCourses);

// CRUD Routes for Instructors
router.post('/', protect, instructor, createCourse);
router.put('/:id', protect, instructor, updateCourse);
router.delete('/:id', protect, instructor, deleteCourse);

module.exports = router;
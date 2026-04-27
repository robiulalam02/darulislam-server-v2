const express = require('express');
const router = express.Router();
const { getPendingTeachers, approveTeacher, getPublicTeachers, deleteTeacher } = require('../controllers/teacherController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public Route
router.get('/', getPublicTeachers);

// Protected Route (Admin)
router.get('/pending', protect, admin, getPendingTeachers);
router.put('/:id/approve', protect, admin, approveTeacher);
router.delete('/:id', protect, admin, deleteTeacher);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
    createTestimonial,
    getPublicTestimonials,
    getAdminTestimonials,
    updateApprovalStatus,
    deleteTestimonial
} = require('../controllers/testimonialController');

const { protect, admin } = require('../middlewares/authMiddleware');

// Public route for the homepage
router.get('/', getPublicTestimonials);

// Student route to submit a review (Requires login)
router.post('/', protect, createTestimonial);

// Admin-only routes
router.get('/admin', protect, admin, getAdminTestimonials);
router.put('/:id/approve', protect, admin, updateApprovalStatus);
router.delete('/:id', protect, admin, deleteTestimonial);

module.exports = router;
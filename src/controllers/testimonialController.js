const Testimonial = require('../models/Testimonial');

// Create Testimonial (User)
const createTestimonial = async (req, res) => {
    try {
        const { text, rating } = req.body;

        const testimonial = await Testimonial.create({
            user: req.user._id,
            text,
            rating
        });

        res.status(201).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get ALl Testimonial (Public)
const getPublicTestimonials = async (req, res) => {
    try {
        // Filter strictly for isApproved: true
        const testimonials = await Testimonial.find({ isApproved: true })
            .populate('user', 'name role')
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Testimonial (Admin)
const getAdminTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({})
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Testimonial Status (Admin)
const updateApprovalStatus = async (req, res) => {
    try {
        const { isApproved } = req.body;

        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { isApproved },
            { new: true, runValidators: true }
        );

        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        res.status(200).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE Testimonial (Admin)
const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        await testimonial.deleteOne();
        res.status(200).json({ message: 'Testimonial removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTestimonial,
    getPublicTestimonials,
    getAdminTestimonials,
    updateApprovalStatus,
    deleteTestimonial
};
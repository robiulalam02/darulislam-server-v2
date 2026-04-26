const Course = require('../models/Course');
const Category = require('../models/Category');

// CREATE new course
const createCourse = async (req, res) => {
    try {
        const { title, description, thumbnail, category, duration } = req.body;

        // Verify the category actually exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Create the course
        const course = await Course.create({
            title,
            description,
            thumbnail,
            category,
            instructor: req.user._id, // From protect middleware
            duration
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET courses (Public)
const getCourses = async (req, res) => {
    try {
        let filter = { isPublished: true };

        // If a category ID is in the URL (e.g., /api/courses?category=123), filter by it
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // .populate() fetches the actual names instead of just the raw Object IDs
        const courses = await Course.find(filter)
            .populate('category', 'name icon')
            .populate('instructor', 'name email');

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE Course
const updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If the update includes changing the category, verify the new category exists
        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                return res.status(404).json({ message: 'The new category provided does not exist' });
            }
        }

        // Update the course
        course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE Course
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Course removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCourse,
    getCourses,
    updateCourse,
    deleteCourse,
};
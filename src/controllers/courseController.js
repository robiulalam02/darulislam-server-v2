const Course = require('../models/Course');
const Category = require('../models/Category');

const createCourse = async (req, res) => {
    try {
        const { title, description, thumbnail, category, duration, courseType } = req.body;

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const course = await Course.create({
            title,
            description,
            thumbnail,
            category,
            instructor: req.user._id, 
            duration,
            courseType
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourses = async (req, res) => {
    try {
        let filter = { isPublished: true };

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const courses = await Course.find(filter)
            .populate('category', 'name icon')
            .populate('instructor', 'name email');

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                return res.status(404).json({ message: 'The new category provided does not exist' });
            }
        }

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

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
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
    getTeacherCourses,
    updateCourse,
    deleteCourse,
};
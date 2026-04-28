const TeacherProfile = require('../models/TeacherProfile');
const User = require('../models/User');
const Course = require('../models/Course');

const getPendingTeachers = async (req, res) => {
    try {
        const pendingTeachers = await TeacherProfile.find({ isApproved: false })
            .populate('user', 'name email')
            .populate('department', 'name')
            .sort({ createdAt: 1 });

        res.status(200).json(pendingTeachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveTeacher = async (req, res) => {
    try {
        const profile = await TeacherProfile.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        await User.findByIdAndUpdate(
            profile.user,
            { role: 'teacher' },
            { new: true }
        );

        res.status(200).json({ message: 'Teacher approved and role upgraded successfully', profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        // 1. Find the teacher profile by the ID passed in the URL
        const profile = await TeacherProfile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        // 2. Save the linked User ID before we delete the profile
        const userId = profile.user;

        // 3. Delete the Teacher Profile (removes them from the public site)
        await profile.deleteOne();

        // 4. Demote the User back to a student!
        await User.findByIdAndUpdate(
            userId,
            { role: 'student' },
            { new: true }
        );

        res.status(200).json({
            message: 'Teacher profile deleted and user successfully demoted to student'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublicTeachers = async (req, res) => {
    try {
        // 1. Only fetch teachers where the admin has clicked 'Approve'
        const teachers = await TeacherProfile.find({ isApproved: true })
            // 2. Security Check: Only populate the 'name'. NEVER populate email or phone here!
            .populate('user', 'name')
            // 3. Populate the department (Bivag) so the frontend can display the category name
            .populate('department', 'name');

        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const teacherId = req.user._id;

        // 1. Calculate Total Courses owned by this teacher
        const totalCourses = await Course.countDocuments({ instructor: teacherId });

        // 2. Placeholder for Total Students
        const totalStudents = 0; 

        // 3. Placeholder for New Questions
        const newQuestions = 0;

        res.status(200).json({
            totalCourses,
            totalStudents,
            newQuestions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPendingTeachers,
    approveTeacher,
    getPublicTeachers,
    deleteTeacher,
    getDashboardStats
};
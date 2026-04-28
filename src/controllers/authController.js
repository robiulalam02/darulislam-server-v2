const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const TeacherProfile = require('../models/TeacherProfile');

const registerUser = async (req, res) => {
    try {
        const {
            name, email, phone, password,
            isTeacherMode, gender, department, designation, biography, qualifications
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 1. Create the user
        const user = await User.create({ name, email, phone, password, gender });

        let profileData = null; // Prepare an empty profile variable

        // 2. Handle Teacher Profile with Rollback
        if (isTeacherMode === true) {
            try {
                // Save the created profile into our variable!
                profileData = await TeacherProfile.create({
                    user: user._id,
                    department,
                    designation,
                    biography,
                    qualifications,
                    isApproved: false
                });
            } catch (profileError) {
                await User.findByIdAndDelete(user._id);
                return res.status(400).json({ message: `Profile Error: ${profileError.message}` });
            }
        }

        // 3. Success Response (Now including the profile!)
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            role: user.role,
            profile: profileData,
            message: isTeacherMode ? 'Registration successful. Teacher profile pending admin approval.' : 'Registration successful.',
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Authenticate user & get token (Login)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user
        const user = await User.findOne({ email });

        // 2. Check password (assuming you have a matchPassword method on your User schema)
        if (user && (await user.matchPassword(password))) {

            // 3. Look for a Teacher Profile linked to this user
            const teacherProfile = await TeacherProfile.findOne({ user: user._id }).populate('department', 'name');

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                role: user.role,
                profile: teacherProfile || null,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get user profile
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // Never send the password hash back!

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profileData = null;

        // If the user is a teacher, fetch their specific public profile data
        if (user.role === 'teacher') {
            profileData = await TeacherProfile.findOne({ user: user._id }).populate('department', 'name');
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profile: profileData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
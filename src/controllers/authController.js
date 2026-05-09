const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const TeacherProfile = require("../models/TeacherProfile");

const registerUser = async (req, res) => {
  try {
    const { email, studentMobile, password, role, ...rest } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { phone: studentMobile }],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "ব্যবহারকারী ইতিমধ্যে বিদ্যমান (User exists)" });
    }

    const profileImage = req.file ? req.file.path : null;

    // 1. Create Base User
    const user = await User.create({
      ...rest,
      name: req.body.studentNameEn,
      phone: studentMobile,
      email,
      password,
      role: role || "student",
      profileImage,
    });

    // 2. Create Teacher Profile if applicable
    if (user.role === "teacher") {
      await TeacherProfile.create({
        user: user._id,
        department: req.body.department, // Passed from Step 2 for teachers
        designation: req.body.designation,
        qualifications: req.body.qualifications,
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticate user & get token (Login)
const loginUser = async (req, res) => {
  try {
    const { email: identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both an email/phone and a password" });
    }

    // 1. Find the user using the $or operator
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    // 2. Check password (assuming you have a matchPassword method on your User schema)
    if (user && (await user.matchPassword(password))) {
      // 3. Look for a Teacher Profile linked to this user
      const teacherProfile = await TeacherProfile.findOne({
        user: user._id,
      }).populate("department", "name");

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
      res.status(401).json({ message: "Invalid email/phone or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // Never send the password hash back!

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileData = null;

    // If the user is a teacher, fetch their specific public profile data
    if (user.role === "teacher") {
      profileData = await TeacherProfile.findOne({ user: user._id }).populate(
        "department",
        "name",
      );
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile: profileData,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });

    // 2. If they don't exist, create a new student account
    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(-15) + process.env.JWT_SECRET;
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: "student",
      });
    }

    // 3. Send back the exact same data as a normal login
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
};

const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const StudentProfile = require("../models/StudentProfile");


const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    // Find Users
    let users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    const userIds = users.map((user) => user._id);

    // Merge teacher profile if the role is teacher
    if (role === "teacher") {
      const profiles = await TeacherProfile.find({
        user: { $in: userIds },
      }).populate("department", "name");

      users = users.map((user) => {
        const profile = profiles.find(
          (p) => p.user.toString() === user._id.toString(),
        );
        return { ...user._doc, profileData: profile || null };
      });
    }
    // merge student profile if the role is student
    else if (role === "student") {
      const profiles = await StudentProfile.find({ user: { $in: userIds } });

      users = users.map((user) => {
        const profile = profiles.find(
          (p) => p.user.toString() === user._id.toString(),
        );
        return { ...user._doc, profileData: profile || null };
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const approveTeacher = async (req, res) => {
  try {
    const { isApproved } = req.body; // have to send true or false
    const userId = req.params.id;

    const profile = await TeacherProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    profile.isApproved = isApproved;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Teacher ${isApproved ? "approved" : "disapproved"} successfully`,
      isApproved: profile.isApproved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const validRoles = ["student", "teacher", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    if (role === "teacher") {
      const existingProfile = await TeacherProfile.findOne({ user: userId });
      if (!existingProfile) {
        await TeacherProfile.create({
          user: userId,
          designation: "New Teacher",
          isApproved: false,
        });
      }
    } else if (role === "student") {
      const existingProfile = await StudentProfile.findOne({ user: userId });
      if (!existingProfile) {
        await StudentProfile.create({ user: userId });
      }
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: { id: user._id, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  approveTeacher,
};
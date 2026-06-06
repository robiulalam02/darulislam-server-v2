const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const StudentProfile = require("../models/StudentProfile");

// Get All Users with Search & Filter
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    // Dynamic text search for name and email matching
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    let users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    const userIds = users.map((user) => user._id);

    if (role === "teacher") {
      const profiles = await TeacherProfile.find({
        user: { $in: userIds },
      }).populate("department", "name");

      users = users.map((user) => {
        const profile = profiles.find(
          (p) => p.user.toString() === user._id.toString()
        );
        return { ...user._doc, profileData: profile || null };
      });
    } else if (role === "student") {
      const profiles = await StudentProfile.find({ user: { $in: userIds } });

      users = users.map((user) => {
        const profile = profiles.find(
          (p) => p.user.toString() === user._id.toString()
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

// Get Single User Details By ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileData = null;

    if (user.role === "teacher") {
      profileData = await TeacherProfile.findOne({ user: user._id }).populate("department", "name");
    } else if (user.role === "student") {
      profileData = await StudentProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        ...user._doc,
        profileData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User and Extended Profile Data (Admin)
const adminUpdateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;
    let { profileData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Update core credentials data
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    
    if (req.file) {
      user.profileImage = req.file.path; 
    }
    await user.save();

    // 2. Parse stringified nested profile payload from FormData execution
    if (profileData && typeof profileData === "string") {
      try {
        profileData = JSON.parse(profileData);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid profileData JSON structure" });
      }
    }

    // 3. Update correlated profile layouts cleanly based on active roles
    if (user.role === "teacher" && profileData) {
      await TeacherProfile.findOneAndUpdate(
        { user: userId },
        { $set: profileData },
        { new: true, runValidators: true, upsert: true }
      );
    } else if (user.role === "student" && profileData) {
      await StudentProfile.findOneAndUpdate(
        { user: userId },
        { $set: profileData },
        { new: true, runValidators: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "User and profile datasets updated successfully",
      image: user.image
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete User and clear related profiles safely
const adminDeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove associated child structures to prevent dead data references
    if (user.role === "teacher") {
      await TeacherProfile.deleteOne({ user: userId });
    } else if (user.role === "student") {
      await StudentProfile.deleteOne({ user: userId });
    }

    // Remove primary authentication key document
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User and corresponding profile data permanently removed"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveTeacher = async (req, res) => {
  try {
    const { isApproved } = req.body;
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
  getUserById,
  adminUpdateUser,
  adminDeleteUser,
  updateUserRole,
  approveTeacher,
};
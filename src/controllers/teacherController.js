const TeacherProfile = require("../models/TeacherProfile");
const User = require("../models/User");
const Course = require("../models/Course");

const getPendingTeachers = async (req, res) => {
  try {
    const { search, status, department, experience } = req.query;
    let profileFilter = {};

    // 1. Status Filter (pending / approved)
    if (status === "pending") {
      profileFilter.isApproved = false;
    } else if (status === "approved") {
      profileFilter.isApproved = true;
    }

    // 2. Department ObjectID Filter
    if (department) {
      profileFilter.department = department;
    }

    // 3. Experience Bangla String Filter (Exact or Regex mapping)
    if (experience) {
      profileFilter.experience = { $regex: experience, $options: "i" };
    }

    // 4. Name/Email Search Query Handling
    let matchedUserIds = [];
    if (search) {
      const users = await User.find({
        role: "teacher",
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      matchedUserIds = users.map((u) => u._id);

      // Inject user reference limitation to main aggregation query
      profileFilter.user = { $in: matchedUserIds };
    }

    // Execute Main Query with Populated References
    const teachers = await TeacherProfile.find(profileFilter)
      .populate("user", "name email phone profileImage")
      .populate("department", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalCount: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveTeacher = async (req, res) => {
  try {
    const profile = await TeacherProfile.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    );

    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    await User.findByIdAndUpdate(
      profile.user,
      { role: "teacher" },
      { new: true },
    );

    res.status(200).json({
      message: "Teacher approved and role upgraded successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    // 1. Find the teacher profile by the ID passed in the URL
    const profile = await TeacherProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    // 2. Save the linked User ID before we delete the profile
    const userId = profile.user;

    // 3. Delete the Teacher Profile (removes them from the public site)
    await profile.deleteOne();

    // 4. Demote the User back to a student!
    await User.findByIdAndUpdate(userId, { role: "student" }, { new: true });

    res.status(200).json({
      message:
        "Teacher profile deleted and user successfully demoted to student",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicTeachers = async (req, res) => {
  try {
    const limitCount = req.query.limit ? parseInt(req.query.limit) : 0;

    const teachers = await TeacherProfile.find({ isApproved: true })
      .populate("user", "name email phone profileImage")
      .populate("department", "name")
      .sort({ createdAt: 1 })
      .limit(limitCount);

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
      newQuestions,
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
  getDashboardStats,
};

const Notice = require("../models/Notice");

// Create a new notice for targeted course students
const createNotice = async (req, res) => {
  try {
    const instructorId = req.user._id;

    if (!req.body.title || !req.body.description || !req.body.course) {
      return res
        .status(400)
        .json({ message: "Mandatory fields cannot be left empty" });
    }

    const newNotice = await Notice.create({
      ...req.body,
      instructor: instructorId,
    });

    res
      .status(201)
      .json({ message: "Notice published successfully", data: newNotice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing notice matching instructor authority
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ message: "Notice data entry not found" });
    }

    if (notice.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized alteration request on this asset" });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    res
      .status(200)
      .json({ message: "Notice updated successfully", data: updatedNotice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch operational metrics alongside notice data stream
const getInstructorNotices = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const notices = await Notice.find({ instructor: instructorId })
      .populate("course", "name category banner")
      .sort({ pinned: -1, createdAt: -1 }); // Prioritize pinned items first

    // Aggregate statistics metrics array
    const stats = {
      totalNotice: notices.length,
      urgent: notices.filter((n) => n.type === "urgent").length,
      pinned: notices.filter((n) => n.pinned === true).length,
    };

    res.status(200).json({
      stats,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentNotices = async (req, res) => {
  try {
    const { courseIds } = req.query;
    const queryFilter = {};

    if (courseIds) {
      // Split the comma-separated string from URL into a clean array of ObjectIds
      // Example input: "id1,id2" -> Output array: ["id1", "id2"]
      const targetCourseIds = courseIds.split(",").map((id) => id.trim());

      // MongoDB $in operator handles searching multiple values inside an array simultaneously
      queryFilter.course = { $in: targetCourseIds };
    }

    const notices = await Notice.find(queryFilter)
      .populate("course", "title category banner")
      .populate("instructor", "name profilePicture")
      .sort({ pinned: -1, createdAt: -1 }); // Pinned notices stay top, rest sorted by latest date

    res.status(200).json({
      totalCount: notices.length,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ message: "Notice data entry not found" });
    }

    if (notice.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized destruction request on this asset" });
    }

    await Notice.findByIdAndDelete(id);

    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotice,
  updateNotice,
  getInstructorNotices,
  getStudentNotices,
  deleteNotice,
};

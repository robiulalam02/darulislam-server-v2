const ClassLink = require("../models/ClassLink");

// Create Class Link
const createClassLink = async (req, res) => {
  try {
    const instructorId = req.user._id;

    if (
      !req.body.course ||
      !req.body.classTitle ||
      !req.body.link ||
      !req.body.classDate ||
      !req.body.startTime ||
      !req.body.endTime
    ) {
      return res.status(400).json({ message: "সবগুলো ফিল্ড পূরণ করুন" });
    }

    const [hours, minutes] = req.body.endTime.split(":");
    const expiryDate = new Date(req.body.classDate);
    expiryDate.setHours(parseInt(hours) + 2, parseInt(minutes), 0, 0);

    const newLink = await ClassLink.create({
      ...req.body,
      instructor: instructorId,
      expiresAt: expiryDate,
    });

    res
      .status(201)
      .json({ message: "ক্লাস লিঙ্ক সফলভাবে পোস্ট হয়েছে", data: newLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Class Links
const getClassLinks = async (req, res) => {
  try {
    const links = await ClassLink.find({ instructor: req.user._id })
      .populate("course", "title category image")
      .sort({ classDate: 1 });

    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Class Link
const updateClassLink = async (req, res) => {
  try {
    const { id } = req.params;
    const classLink = await ClassLink.findById(id);

    if (!classLink) {
      return res.status(404).json({ message: "লিঙ্কটি পাওয়া যায়নি" });
    }

    if (classLink.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "আপনি এই লিঙ্কটি এডিট করার যোগ্য নন" });
    }

    if (req.body.endTime || req.body.classDate) {
      const targetDate = req.body.classDate || classLink.classDate;
      const targetEndTime = req.body.endTime || classLink.endTime;

      const [hours, minutes] = targetEndTime.split(":");
      const expiryDate = new Date(targetDate);
      expiryDate.setHours(parseInt(hours) + 2, parseInt(minutes), 0, 0);

      req.body.expiresAt = expiryDate;
    }

    const updatedLink = await ClassLink.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    res
      .status(200)
      .json({ message: "লিঙ্ক সফলভাবে আপডেট হয়েছে", data: updatedLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Class Link Manually
const deleteClassLink = async (req, res) => {
  try {
    const { id } = req.params;
    const classLink = await ClassLink.findById(id);

    if (!classLink) {
      return res.status(404).json({ message: "লিঙ্কটি পাওয়া যায়নি" });
    }

    if (classLink.instructor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "আপনি এই লিঙ্কটি ডিলিট করতে পারবেন না" });
    }

    await ClassLink.findByIdAndDelete(id);
    res.status(200).json({ message: "ক্লাস লিঙ্ক সফলভাবে ডিলিট হয়েছে" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClassLink,
  getClassLinks,
  updateClassLink,
  deleteClassLink,
};
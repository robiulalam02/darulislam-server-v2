const Enrollment = require("../models/Enrollment");
const Batch = require("../models/Batch");
const Course = require("../models/Course");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");

const createEnrollmentRequest = async (req, res) => {
  try {
    const {
      courseId,
      method,
      senderName,
      bkashNumber,
      transactionId,
      amountPaid,
    } = req.body;

    const txExists = await Enrollment.findOne({
      "paymentDetails.transactionId": transactionId,
    });
    if (txExists) {
      return res
        .status(400)
        .json({ message: "This Transaction ID has already been submitted" });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      paymentDetails: {
        method,
        senderName,
        bkashNumber,
        transactionId,
        amountPaid,
      },
    });

    res.status(201).json({
      success: true,
      message:
        "Enrollment request submitted successfully. Awaiting admin approval.",
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEnrollmentLogs = async (req, res) => {
  try {
    const { status, searchId } = req.query;
    let query = {};

    if (status) query.status = status;

    if (searchId) {
      const matchedProfile = await StudentProfile.findOne({
        studentId: { $regex: searchId.trim(), $options: "i" },
      });
      if (matchedProfile) {
        query.student = matchedProfile.user;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    const logs = await Enrollment.find(query)
      .populate("student", "name email profileImage")
      .populate("course", "title price")
      .populate("batch", "batchName maxSeats enrolledStudents")
      .sort({ createdAt: -1 })
      .lean();

    // Map All Users ID's
    const studentUserIds = logs.map((log) => log.student?._id).filter(Boolean);

    // Took Real Time Custom ID from their Profile
    const studentProfiles = await StudentProfile.find({
      user: { $in: studentUserIds },
    })
      .select("user studentId")
      .lean();

    const sanitizedLogs = logs.map((log) => {
      const matchedProfile = studentProfiles.find(
        (p) => log.student && p.user.toString() === log.student._id.toString(),
      );

      return {
        ...log,
        student: log.student
          ? {
              ...log.student,
              studentId: matchedProfile ? matchedProfile.studentId : null,
            }
          : { name: "Unknown Student", email: "N/A", studentId: null },
        course: log.course || { title: "Unknown Course", price: 0 },
        batch: log.batch || {
          batchName: "Not Allocated Yet",
          maxSeats: 0,
          enrolledStudents: [],
        },
      };
    });

    res.status(200).json({
      success: true,
      count: sanitizedLogs.length,
      data: sanitizedLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId, alternateBatchId } = req.body;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }
    if (enrollment.status === "approved") {
      return res
        .status(400)
        .json({ message: "This request is already approved" });
    }

    if (!alternateBatchId) {
      return res.status(400).json({
        message: "Please select a specific batch to allocate this student",
      });
    }

    const batch = await Batch.findById(alternateBatchId);
    if (!batch) {
      return res
        .status(404)
        .json({ message: "Assigned batch group not found" });
    }

    if (batch.enrolledStudents.length >= batch.maxSeats) {
      return res.status(400).json({
        message: `Allocation failed. ${batch.batchName} has reached maximum seat capacity (${batch.maxSeats}/${batch.maxSeats}).`,
      });
    }

    batch.enrolledStudents.push(enrollment.student);

    if (teacherId) {
      batch.teacher = teacherId;

      await Course.findByIdAndUpdate(enrollment.course, {
        $set: { instructor: teacherId },
      });
    }
    await batch.save();

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      id,
      {
        $set: {
          batch: alternateBatchId,
          status: "approved",
          approvedAt: new Date(),
        },
      },
      { new: true, runValidators: false },
    );

    res.status(200).json({
      success: true,
      message:
        "Enrollment approved, teacher successfully synced to course, and batch slot allocated cleanly.",
      data: updatedEnrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment record not found" });
    }
    if (enrollment.status !== "pending") {
      return res
        .status(400)
        .json({ message: `This request is already ${enrollment.status}` });
    }

    enrollment.status = "rejected";
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Enrollment request has been rejected successfully.",
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEnrollmentRequest,
  getEnrollmentLogs,
  approveEnrollment,
  rejectEnrollment,
};

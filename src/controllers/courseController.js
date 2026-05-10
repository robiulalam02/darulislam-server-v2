const Course = require("../models/Course");
const Category = require("../models/Category");

const createCourse = async (req, res) => {
  try {
    const {
      title,
      category,
      duration,
      courseType,
      price,
      oldPrice,
      label,
      // details fields
      fullTitle,
      courseDescription,
      admissionFee,
      oldAdmissionFee,
      monthlyFee,
      discount,
      coupon,
      batchInfo,
      highlights,
    } = req.body;

    // Handle Image Upload
    const thumbnail = req.file ? req.file.path : null;
    if (!thumbnail) {
      return res.status(400).json({ message: "Course thumbnail is required" });
    }

    let parsedHighlights = [];
    if (highlights) {
      parsedHighlights =
        typeof highlights === "string" ? JSON.parse(highlights) : highlights;
    }

    const course = await Course.create({
      title,
      image: thumbnail,
      category,
      instructor: req.user._id,
      duration,
      courseType,
      price: price || 0,
      oldPrice: oldPrice || 0,
      label: label || "",
      details: {
        fullTitle: fullTitle || title,
        description: courseDescription,
        admissionFee: admissionFee || 0,
        oldAdmissionFee: oldAdmissionFee || 0,
        monthlyFee: monthlyFee || 0,
        discount: discount || 0,
        coupon: coupon || "",
        batchInfo: batchInfo || "",
        highlights: parsedHighlights,
      },
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
      .populate("category", "name icon")
      .populate("instructor", "name email");

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEducationPageData = async (req, res) => {
  try {
    const distinctCategories = await Course.distinct("category", {
      isPublished: true,
    });

    // ২. প্রতিটি ক্যাটাগরির জন্য কোর্সগুলো গ্রুপ করা
    const groupedData = await Promise.all(
      distinctCategories.map(async (catName) => {
        const courses = await Course.find({
          category: catName,
          isPublished: true,
        })
          .select("title image price oldPrice label details")
          .limit(8);

        return {
          category: catName,
          type: "card",
          courses: courses.map((c) => ({
            id: c._id,
            title: c.title,
            price: c.price,
            oldPrice: c.oldPrice,
            label: c.label,
            image: c.image,
            details: c.details || {},
          })),
        };
      }),
    );

    const filteredData = groupedData.filter(
      (group) => group.courses.length > 0,
    );

    res.status(200).json(filteredData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // 1. Handle Root Level Data
    const { highlights, ...restOfBody } = req.body;
    let updateData = { ...restOfBody };

    if (req.file) {
      updateData.image = req.file.path; // New image from Couldinary
    }

    // Handle Nested Details Data
    if (
      req.body.fullTitle ||
      req.body.description ||
      req.body.admissionFee ||
      highlights
    ) {
      updateData.details = {
        ...course.details,
        fullTitle: req.body.fullTitle || course.details.fullTitle,
        description: req.body.description || course.details.description,
        admissionFee: req.body.admissionFee || course.details.admissionFee,
        highlights: highlights
          ? typeof highlights === "string"
            ? JSON.parse(highlights)
            : highlights
          : course.details.highlights,
      };
    }

    // Final Update
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    await course.deleteOne();

    res
      .status(200)
      .json({ id: req.params.id, message: "Course removed successfully" });
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
  getEducationPageData,
};

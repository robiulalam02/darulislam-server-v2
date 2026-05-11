const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    studentNameBn: { type: String, trim: true },
    classLevel: { type: String },
    fatherName: { type: String },
    fatherMobile: { type: String },
    fatherJob: { type: String },
    motherName: { type: String },
    motherMobile: { type: String },
    motherJob: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
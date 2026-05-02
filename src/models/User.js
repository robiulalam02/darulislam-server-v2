const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentNameBn: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    profileImage: { type: String },

    birthDate: { type: String },
    gender: { type: String, enum: ["male", "female"] },
    division: { type: String },
    classLevel: { type: String },

    fatherName: { type: String },
    fatherMobile: { type: String },
    fatherJob: { type: String },

    motherName: { type: String },
    motherMobile: { type: String },
    motherJob: { type: String },

    presentDivision: { type: String },
    district: { type: String },
    permanentAddress: { type: String },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

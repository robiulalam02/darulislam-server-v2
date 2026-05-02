const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
} = require("../controllers/authController");

// Import middleware
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);

module.exports = router;

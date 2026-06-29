const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Audio File Configurations
    if (file.mimetype.startsWith("audio/")) {
      return {
        folder: "darulislam_audios",
        resource_type: "auto",
        allowed_formats: ["mp3", "wav"],
      };
    }

    // Image Optimization
    return {
      folder: "user_profiles",
      resource_type: "image",
      format: "webp",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "webp" },
      ],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10 MB File
  },
});

module.exports = upload;
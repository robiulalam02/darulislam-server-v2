const Gallery = require("../models/Gallery");

// 1. Add Image to Gallery (Admin Only - Multipart Form Data)
const addGalleryImage = async (req, res) => {
  try {
    const { title, event } = req.body;

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "কমপক্ষে একটি গ্যালারি ইমেজ প্রয়োজন" });
    }
    if (!title || !event) {
      return res
        .status(400)
        .json({ message: "শিরোনাম এবং ইভেন্ট ট্যাগ বাধ্যতামূলক" });
    }

    const imageUrls = req.files.map((file) => file.path);

    const newAsset = await Gallery.create({
      title,
      event,
      image: imageUrls,
    });

    res
      .status(201)
      .json({ message: "Asset added to gallery successfully", data: newAsset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Gallery Images (Admin View - No Pagination)
const getAdminGallery = async (req, res) => {
  try {
    const assets = await Gallery.find({}).sort({ createdAt: -1 });
    res.status(200).json({ totalCount: assets.length, data: assets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Public Gallery Stream (With Pagination and Optional Filter)
const getPublicGallery = async (req, res) => {
  try {
    const { event, page = 1, limit = 10 } = req.query;
    const queryFilter = {};

    // Dynamic filtering based on event tags if provided
    if (event) {
      queryFilter.event = event;
    }

    // Pagination calculations
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    const totalItems = await Gallery.countDocuments(queryFilter);

    const assets = await Gallery.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    res.status(200).json({
      totalCount: totalItems,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      data: assets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGalleryText = async (req, res) => {
  try {
    const { title, event } = req.body;

    const updatedAsset = await Gallery.findByIdAndUpdate(
      req.params.id,
      { $set: { title, event } },
      { new: true, runValidators: true },
    );

    if (!updatedAsset)
      return res.status(404).json({ message: "Gallery item not found" });
    res
      .status(200)
      .json({
        message: "Gallery texts updated successfully",
        data: updatedAsset,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Delete Gallery Asset (Admin Only)
const deleteGalleryImage = async (req, res) => {
  try {
    const asset = await Gallery.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    await asset.deleteOne();
    res
      .status(200)
      .json({ message: "Asset removed from gallery successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addGalleryImage,
  getAdminGallery,
  getPublicGallery,
  updateGalleryText,
  deleteGalleryImage,
};

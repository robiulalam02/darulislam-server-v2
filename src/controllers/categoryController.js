// src/controllers/categoryController.js
const Category = require('../models/Category');

// GET Category (Public)
const getCategories = async (req, res) => {
    try {
        // Fetch all categories from MongoDB
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE Category (Admin)
const createCategory = async (req, res) => {
    try {
        const { name, icon, description, isActive, displayOrder } = req.body;

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await Category.create({
            name,
            icon,
            description,
            isActive,
            displayOrder
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE Category (Admin)
const updateCategory = async (req, res) => {
    try {
        // 1. Check if the category actually exists first
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // 2. Update it
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE Category (Admin)
const deleteCategory = async (req, res) => {
    try {
        // 1. Find the category
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // 2. Delete it from the database
        await category.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Category removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
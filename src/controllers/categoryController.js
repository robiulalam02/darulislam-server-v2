const Category = require('../models/Category');

// Get All Categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                // 1. The Join: Look into the 'courses' collection
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'category',
                    pipeline: [
                        { $match: { isPublished: true } }
                    ],
                    as: 'publishedCourses'
                }
            },
            {
                // 2. The Math: Count the number of items in that joined array
                $addFields: {
                    courseCount: { $size: "$publishedCourses" }
                }
            },
            {
                // 3. The Cleanup: We only want the count, not the massive array of course data
                $project: {
                    publishedCourses: 0
                }
            },
            {
                // 4. The Sorting: Order them by the displayOrder the admin set!
                $sort: { displayOrder: 1 }
            }
        ]);

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
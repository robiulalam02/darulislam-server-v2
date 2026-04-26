const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a category name'],
            unique: true,
            trim: true
        },
        icon: {
            type: String,
            required: [true, 'Please add an icon identifier or URL']
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true // Categories are visible by default
        },
        displayOrder: {
            type: Number,
            default: 0 // Allows admin to sort categories later
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Category', categorySchema);
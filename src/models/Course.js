const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a course title'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Please add a description']
        },
        thumbnail: {
            type: String,
            required: [true, 'Please add a thumbnail image URL']
        },
        // THE RELATIONAL LINK TO CATEGORY
        category: {
            // type: mongoose.Schema.Types.ObjectId,
            type: String,
            required: true,
            ref: 'Category' 
        },
        // THE RELATIONAL LINK TO INSTRUCTOR
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        duration: {
            type: String,
            default: '0 hours'
        },
        courseType: {
            type: String,
            required: [true, 'Please specify if the course is Online or Offline'],
            default: 'Online'
        },
        isPublished: {
            type: Boolean,
            default: false 
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Course', courseSchema);
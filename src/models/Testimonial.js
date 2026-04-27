const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User' // Links to the student who wrote it
        },
        text: {
            type: String,
            required: [true, 'Please add the testimonial text'],
            maxlength: [500, 'Testimonial cannot be more than 500 characters']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        isApproved: {
            type: Boolean,
            default: false // Strictly false by default for the approval flow
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
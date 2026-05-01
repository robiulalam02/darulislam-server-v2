const express = require('express');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const cors = require('cors');

const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow your Next.js URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
    credentials: true, // Crucial if you are using cookies or sessions later
}));

// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/teachers', teacherRoutes);

app.get('/', (req, res) => {
    res.send('Darul Islam server is running...');
});

// Export the configured app
module.exports = app;
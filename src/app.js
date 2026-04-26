const express = require('express');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('Darul Islam server is running...');
});

// Export the configured app
module.exports = app;
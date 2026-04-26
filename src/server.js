require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

// Connect to the database
connectDB();

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
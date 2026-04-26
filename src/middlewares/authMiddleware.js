// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Check if the token exists and starts with "Bearer"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Extract the token from the string
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user in the database and attach them to the request
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Hand off control to the next function
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
        }
    }

    // 6. If there is no token at all
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Admin Middleware
const admin = (req, res, next) => {
    // Check if the user exists (from the protect middleware) AND is an admin
    if (req.user && req.user.role === 'admin') {
        next(); // Let them pass
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { protect, admin };
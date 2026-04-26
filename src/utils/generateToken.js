const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Sign the token with the user's ID and our secret key
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // The token will expire in 30 days
    });
};

module.exports = generateToken;
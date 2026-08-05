const jwt = require("jsonwebtoken");

/**
 * Generate JWT token for user authentication
 * @param {string} id - Database user ID
 * @param {string} role - Role of the user ('student' | 'faculty' | 'admin')
 * @returns {string} Signed JWT Token
 */
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET || "nexora_super_secret_key_2026",
        { expiresIn: "30d" }
    );
};

module.exports = generateToken;

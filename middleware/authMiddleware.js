const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

/**
 * Protect routes - Verify JWT Access Token
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "nexora_super_secret_key_2026"
            );

            let user = null;
            if (decoded.role === "super_admin" || decoded.role === "admin") {
                user = await Admin.findById(decoded.id).select("-password");
            } else if (decoded.role === "faculty") {
                user = await Faculty.findById(decoded.id).select("-password");
            } else if (decoded.role === "student") {
                user = await Student.findById(decoded.id).select("-password");
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, user account not found"
                });
            }

            req.user = user;
            req.userRole = decoded.role;
            next();
        } catch (error) {
            console.error("Auth Token Verification Failed:", error.message);
            return res.status(401).json({
                success: false,
                message: "Not authorized, token invalid or expired"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no bearer token provided"
        });
    }
};

/**
 * Role-Based Access Control (RBAC)
 * @param {...string} roles Allowed roles ('super_admin', 'admin', 'faculty', 'student')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        const currentRole = req.userRole;
        // Treat super_admin as having full access across admin routes
        if (currentRole === "super_admin" && roles.includes("admin")) {
            return next();
        }
        if (!req.user || !roles.includes(currentRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${currentRole || "Guest"}' is not authorized to perform this operation`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };

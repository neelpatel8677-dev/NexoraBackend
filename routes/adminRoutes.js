const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/adminController");
const { getAllFaculty } = require("../controllers/facultyController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes require authentication and admin/super_admin privileges
router.use(protect);
router.use(authorize("super_admin", "admin"));

// Dashboard Analytics (Supports both /dashboard and /analytics)
router.get("/dashboard", getDashboardAnalytics);
router.get("/analytics", getDashboardAnalytics);

// Admin Faculty List
router.get("/faculty", getAllFaculty);

module.exports = router;

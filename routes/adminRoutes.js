const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("super_admin", "admin"));

router.get("/analytics", getDashboardAnalytics);

module.exports = router;

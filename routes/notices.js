const express = require("express");
const router = express.Router();
const {
    createNotice,
    getNotices,
    deleteNotice
} = require("../controllers/noticeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

// All routes require authentication
router.use(protect);

// Create notice with optional file attachment
router.post(
    "/",
    authorize("faculty", "admin", "super_admin"),
    upload.single("attachment"),
    createNotice
);

// Get notices (filtered by role & category)
router.get("/", getNotices);

// Delete notice (Faculty/Admin only)
router.delete("/:id", authorize("faculty", "admin", "super_admin"), deleteNotice);

module.exports = router;

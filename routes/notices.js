const express = require("express");
const router = express.Router();
const {
    createNotice,
    getNotices,
    deleteNotice
} = require("../controllers/noticeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

// All notice routes require authentication
router.use(protect);

// Create notice with optional file upload (Faculty/Admin only)
router.post(
    "/",
    authorize("faculty", "admin", "super_admin"),
    (req, res, next) => {
        // Safe file parsing middleware
        if (upload && typeof upload.single === "function") {
            return upload.single("attachment")(req, res, next);
        }
        next();
    },
    createNotice
);

// Get notices list
router.get("/", getNotices);

// Delete notice (Faculty/Admin only)
router.delete("/:id", authorize("faculty", "admin", "super_admin"), deleteNotice);

module.exports = router;

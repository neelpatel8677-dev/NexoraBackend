const express = require("express");
const router = express.Router();
const {
    uploadNote,
    getNotes,
    downloadNote,
    deleteNote
} = require("../controllers/noteController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

// All routes require authentication
router.use(protect);

// Upload note (Faculty / Admin only) - Supports 'file', 'note', or 'attachment' field names
router.post(
    "/",
    authorize("faculty", "admin", "super_admin"),
    (req, res, next) => {
        // Use upload.any() to flexibly capture file regardless of Android Part name
        upload.any()(req, res, (err) => {
            if (err) return next(err);
            if (req.files && req.files.length > 0) {
                req.file = req.files[0];
            }
            next();
        });
    },
    uploadNote
);

// Get / Search Notes
router.get("/", getNotes);

// Download Note
router.get("/:id/download", downloadNote);

// Delete Note
router.delete("/:id", authorize("faculty", "admin", "super_admin"), deleteNote);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
    createAssignment,
    getAssignments,
    submitAssignment,
    gradeSubmission,
    getSubmissionsForAssignment
} = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.use(protect);

// Helper middleware to handle flexible file upload keys
const flexibleUpload = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) return next(err);
        if (req.files && req.files.length > 0) {
            req.file = req.files[0];
        }
        next();
    });
};

// Create Assignment (Faculty/Admin)
router.post("/", authorize("faculty", "admin", "super_admin"), flexibleUpload, createAssignment);

// Get Assignments List
router.get("/", getAssignments);

// Submit Assignment Solution (Student)
router.post("/:id/submit", authorize("student"), flexibleUpload, submitAssignment);

// Grade Assignment Submission (Faculty/Admin)
router.post("/submission/:submissionId/grade", authorize("faculty", "admin", "super_admin"), gradeSubmission);

// View Submissions for an Assignment (Faculty/Admin)
router.get("/:id/submissions", authorize("faculty", "admin", "super_admin"), getSubmissionsForAssignment);

module.exports = router;

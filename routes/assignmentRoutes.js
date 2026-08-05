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

router.post("/", authorize("faculty", "admin", "super_admin"), upload.single("attachment"), createAssignment);
router.get("/", getAssignments);
router.post("/:id/submit", authorize("student"), upload.single("solution"), submitAssignment);
router.post("/submission/:submissionId/grade", authorize("faculty", "admin", "super_admin"), gradeSubmission);
router.get("/:id/submissions", authorize("faculty", "admin", "super_admin"), getSubmissionsForAssignment);

module.exports = router;

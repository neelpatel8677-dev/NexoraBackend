const express = require("express");
const router = express.Router();
const {
    uploadResult,
    publishResult,
    getStudentResults,
    deleteResult
} = require("../controllers/resultController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/upload", authorize("faculty", "admin", "super_admin"), uploadResult);
router.patch("/:id/publish", authorize("faculty", "admin", "super_admin"), publishResult);
router.get("/student/:studentId", getStudentResults);
router.delete("/:id", authorize("faculty", "admin", "super_admin"), deleteResult);

module.exports = router;

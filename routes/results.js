const express = require("express");
const router = express.Router();
const {
    uploadResult,
    publishResult,
    getAllResults,
    getStudentResults,
    getRootResults,
    deleteResult
} = require("../controllers/resultController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getRootResults);
router.get("/all", authorize("faculty", "admin", "super_admin"), getAllResults);
router.post("/upload", authorize("faculty", "admin", "super_admin"), uploadResult);
router.patch("/:id/publish", authorize("faculty", "admin", "super_admin"), publishResult);
router.get("/student/:studentId", getStudentResults);
router.delete("/:id", authorize("faculty", "admin", "super_admin"), deleteResult);

module.exports = router;

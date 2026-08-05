const express = require("express");
const router = express.Router();
const {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { subjectValidation } = require("../validators/subjectValidator");

router.use(protect);

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.post("/", authorize("super_admin", "admin"), subjectValidation, createSubject);
router.put("/:id", authorize("super_admin", "admin"), updateSubject);
router.delete("/:id", authorize("super_admin", "admin"), deleteSubject);

module.exports = router;

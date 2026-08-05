const express = require("express");
const router = express.Router();
const {
    getAllStudents,
    getStudentById,
    updateStudentProfile,
    patchStudent,
    deleteStudent
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// GET all students with search & pagination (Faculty + Admin only)
router.get("/", authorize("faculty", "admin", "super_admin"), getAllStudents);

// GET student by ID (student can only get their own; faculty/admin can get any)
router.get("/:id", getStudentById);

// PUT full profile update
router.put("/:id", updateStudentProfile);

// PATCH partial update (Admin/Faculty only)
router.patch("/:id", authorize("admin", "super_admin", "faculty"), patchStudent);

// DELETE student (Admin only)
router.delete("/:id", authorize("admin", "super_admin"), deleteStudent);

module.exports = router;

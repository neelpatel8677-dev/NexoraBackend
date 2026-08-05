const express = require("express");
const router = express.Router();
const {
    getAllFaculty,
    getFacultyById,
    updateFacultyProfile,
    patchFaculty,
    deleteFaculty
} = require("../controllers/facultyController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// GET all faculty with search, designation & department filter + pagination
router.get("/", getAllFaculty);

// GET faculty by ID
router.get("/:id", getFacultyById);

// PUT full profile update (faculty updates own; admin updates any)
router.put("/:id", updateFacultyProfile);

// PATCH partial update (Admin only)
router.patch("/:id", authorize("admin", "super_admin"), patchFaculty);

// DELETE faculty (Admin only)
router.delete("/:id", authorize("admin", "super_admin"), deleteFaculty);

module.exports = router;

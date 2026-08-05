const express = require("express");
const router = express.Router();
const {
    createOrUpdateTimetable,
    getStudentTimetable,
    getFacultySchedule
} = require("../controllers/timetableController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", authorize("super_admin", "admin"), createOrUpdateTimetable);
router.get("/student", getStudentTimetable);
router.get("/faculty", authorize("faculty", "admin", "super_admin"), getFacultySchedule);

module.exports = router;

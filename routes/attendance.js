const express = require("express");
const router = express.Router();
const {
    markAttendance,
    markLectureAttendance,
    getStudentAttendance,
    getClassAttendance,
    getRootAttendance,
    bulkMarkAttendance
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getRootAttendance);
router.post("/mark", authorize("faculty", "admin", "super_admin"), markAttendance);
router.post("/bulk", authorize("faculty", "admin", "super_admin"), bulkMarkAttendance);
router.post("/lecture", authorize("faculty", "admin", "super_admin"), markLectureAttendance);
router.get("/student/:studentId", getStudentAttendance);
router.get("/class", authorize("faculty", "admin", "super_admin"), getClassAttendance);

module.exports = router;

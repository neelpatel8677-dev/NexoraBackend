const express = require("express");
const router = express.Router();
const {
    createOrUpdateTimetable,
    getStudentTimetable,
    getFacultySchedule,
    uploadTimetableImage,
    getTimetableImage
} = require("../controllers/timetableController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.use(protect);

router.post("/", authorize("super_admin", "admin"), createOrUpdateTimetable);
router.post("/upload", authorize("faculty", "admin", "super_admin"), upload.single("file"), uploadTimetableImage);
router.get("/student", getStudentTimetable);
router.get("/faculty", authorize("faculty", "admin", "super_admin"), getFacultySchedule);
router.get("/image", getTimetableImage);

module.exports = router;

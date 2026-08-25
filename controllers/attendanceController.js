const Attendance = require("../models/Attendance");
const LectureAttendance = require("../models/LectureAttendance");
const Student = require("../models/Student");
const { sendPushNotification } = require("../services/fcmService");

/**
 * @desc    Mark Daily Full-Day Attendance
 * @route   POST /api/attendance/mark
 * @access  Private (Faculty, Admin)
 */
const markAttendance = async (req, res, next) => {
    try {
        const { date, subject, department, branch, semester, section, records } = req.body;

        if (!subject || !department || !semester || !records || !Array.isArray(records)) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required class parameters and records array"
            });
        }

        const attendanceDate = date ? new Date(date) : new Date();

        const attendance = await Attendance.create({
            date: attendanceDate,
            subject,
            department,
            branch: branch || "Computer Engineering",
            semester,
            section: section || "A",
            faculty: req.user._id,
            records
        });

        // Notify absent students asynchronously
        records.forEach(async (r) => {
            if (r.status === "Absent") {
                const student = await Student.findById(r.student);
                if (student && student.fcmToken) {
                    await sendPushNotification(
                        student.fcmToken,
                        "Attendance Notice ⚠️",
                        `You were marked Absent for ${subject} on ${attendanceDate.toLocaleDateString()}`,
                        { type: "Attendance" },
                        student._id
                    );
                }
            }
        });

        res.status(201).json({
            success: true,
            message: "Daily attendance marked successfully",
            attendance
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark Lecture-Wise Attendance
 * @route   POST /api/attendance/lecture
 * @access  Private (Faculty, Admin)
 */
const markLectureAttendance = async (req, res, next) => {
    try {
        const { date, subject, department, branch, semester, section, timeSlot, periodNumber, records } = req.body;

        const lecture = await LectureAttendance.create({
            date: date ? new Date(date) : new Date(),
            subject,
            department,
            branch: branch || "Computer Engineering",
            semester,
            section: section || "A",
            timeSlot: timeSlot || "09:00 AM - 10:00 AM",
            periodNumber: periodNumber || 1,
            faculty: req.user._id,
            records
        });

        res.status(201).json({
            success: true,
            message: "Lecture attendance recorded successfully",
            lecture
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Student Overall Attendance List
 * @route   GET /api/attendance/student/:studentId
 * @access  Private
 */
const getStudentAttendance = async (req, res, next) => {
    try {
        let studentId = req.params.studentId;
        if (!studentId || studentId === "me") {
            studentId = req.user._id.toString();
        }

        // Students can only view their own attendance
        if (req.userRole === "student" && req.user._id.toString() !== studentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own attendance records."
            });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const attendanceDocs = await Attendance.find({ "records.student": studentId })
            .populate("faculty", "name email department")
            .sort({ date: -1 });

        // Map into flat structure matching Android Attendance model
        const list = attendanceDocs.map(doc => {
            const rec = doc.records.find(r => r.student.toString() === studentId.toString());
            return {
                _id: doc._id,
                date: doc.date,
                subject: doc.subject,
                status: rec ? rec.status : "Absent",
                faculty: doc.faculty,
                semester: doc.semester,
                department: doc.department
            };
        });

        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Class Attendance
 * @route   GET /api/attendance/class
 * @access  Private (Faculty, Admin)
 */
const getClassAttendance = async (req, res, next) => {
    try {
        const { subject, department, semester, section } = req.query;

        let query = {};
        if (subject) query.subject = subject;
        if (department) query.department = department;
        if (semester) query.semester = Number(semester);
        if (section) query.section = section;

        const history = await Attendance.find(query)
            .populate("faculty", "name employeeId")
            .populate("records.student", "name enrollmentNo rollNo")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Root Attendance endpoint - dynamically serves student or class attendance
 * @route   GET /api/attendance or GET /api/attendence
 * @access  Private
 */
const getRootAttendance = async (req, res, next) => {
    try {
        if (req.userRole === "student") {
            req.params.studentId = req.user._id.toString();
            return getStudentAttendance(req, res, next);
        }
        return getClassAttendance(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markAttendance,
    markLectureAttendance,
    getStudentAttendance,
    getClassAttendance,
    getRootAttendance
};

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

        // Populate faculty details
        const attendanceDocs = await Attendance.find({ "records.student": studentId })
            .populate("faculty", "name email department")
            .sort({ date: -1 });

        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        const subjectStatsMap = {};

        // Map into flat structure matching Android Attendance model
        const list = attendanceDocs.map(doc => {
            const rec = doc.records.find(r => r.student.toString() === studentId.toString());
            const status = rec ? rec.status : "Absent";

            if (status === "Present") presentCount++;
            else if (status === "Absent") absentCount++;
            else if (status === "Late") lateCount++;

            // Subject wise stats
            if (!subjectStatsMap[doc.subject]) {
                subjectStatsMap[doc.subject] = { total: 0, present: 0, absent: 0, late: 0 };
            }
            subjectStatsMap[doc.subject].total++;
            if (status === "Present") subjectStatsMap[doc.subject].present++;
            else if (status === "Absent") subjectStatsMap[doc.subject].absent++;
            else if (status === "Late") subjectStatsMap[doc.subject].late++;

            return {
                _id: doc._id,
                date: doc.date,
                subject: doc.subject,
                status: status,
                faculty: doc.faculty,
                semester: doc.semester,
                department: doc.department
            };
        });

        const totalClasses = attendanceDocs.length;
        const percentage = totalClasses > 0 ? (presentCount * 100) / totalClasses : 0;

        res.status(200).json({
            success: true,
            summary: {
                studentId,
                totalClasses,
                presentCount,
                absentCount,
                lateCount,
                overallPercentage: percentage.toFixed(0) + "%",
                isShortage: percentage < 75
            },
            subjectWiseStats: subjectStatsMap,
            records: list
        });
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

/**
 * @desc    Bulk Mark Attendance (from Android app list)
 * @route   POST /api/attendance/bulk
 * @access  Private (Faculty, Admin)
 */
const bulkMarkAttendance = async (req, res, next) => {
    try {
        const attendanceList = req.body; // Array of { studentId, status, subject, date, department, semester }

        if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Payload must be a non-empty array of attendance records"
            });
        }

        // Take metadata from the first record
        const first = attendanceList[0];
        const date = first.date ? new Date(first.date) : new Date();
        const subject = first.subject || "General";
        const department = first.department || "Unknown";
        const semester = first.semester || 1;

        // Group records for the backend model
        const records = attendanceList.map(item => ({
            student: item.studentId,
            status: item.status || "Present"
        }));

        const attendance = await Attendance.create({
            date,
            subject,
            department,
            branch: first.branch || department, // Fallback to department if branch missing
            semester,
            section: first.section || "A",
            faculty: req.user._id,
            records
        });

        res.status(201).json({
            success: true,
            message: "Bulk attendance marked successfully",
            attendance
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markAttendance,
    markLectureAttendance,
    getStudentAttendance,
    getClassAttendance,
    getRootAttendance,
    bulkMarkAttendance
};

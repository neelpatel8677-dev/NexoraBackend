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

        // Notify absent students via FCM
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
 * @desc    Get Student Overall, Monthly & Subject-wise Attendance Analytics
 * @route   GET /api/attendance/student/:studentId
 * @access  Private
 */
const getStudentAttendance = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const attendanceDocs = await Attendance.find({ "records.student": studentId })
            .populate("faculty", "name email department")
            .sort({ date: -1 });

        let totalClasses = attendanceDocs.length;
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;

        const subjectStats = {};
        const monthlyStats = {};

        attendanceDocs.forEach((doc) => {
            const studentRecord = doc.records.find((r) => r.student.toString() === studentId.toString());
            const status = studentRecord ? studentRecord.status : "Absent";

            if (status === "Present") presentCount++;
            else if (status === "Absent") absentCount++;
            else if (status === "Late") lateCount++;

            // Subject-wise tracking
            if (!subjectStats[doc.subject]) {
                subjectStats[doc.subject] = { total: 0, present: 0, absent: 0, late: 0 };
            }
            subjectStats[doc.subject].total++;
            if (status === "Present") subjectStats[doc.subject].present++;
            else if (status === "Absent") subjectStats[doc.subject].absent++;
            else if (status === "Late") subjectStats[doc.subject].late++;

            // Monthly tracking
            const monthYear = new Date(doc.date).toLocaleString("default", { month: "short", year: "numeric" });
            if (!monthlyStats[monthYear]) {
                monthlyStats[monthYear] = { total: 0, present: 0 };
            }
            monthlyStats[monthYear].total++;
            if (status === "Present") monthlyStats[monthYear].present++;
        });

        const overallPercentage = totalClasses > 0 ? parseFloat(((presentCount / totalClasses) * 100).toFixed(2)) : 0;

        res.status(200).json({
            success: true,
            summary: {
                studentId,
                totalClasses,
                presentCount,
                absentCount,
                lateCount,
                overallPercentage: `${overallPercentage}%`,
                isShortage: overallPercentage < 75
            },
            subjectWiseStats: subjectStats,
            monthlyStats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Class Attendance Analytics
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

module.exports = {
    markAttendance,
    markLectureAttendance,
    getStudentAttendance,
    getClassAttendance
};

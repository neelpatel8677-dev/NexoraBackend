const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Student = require("../models/Student");
const { sendTopicNotification, sendPushNotification } = require("../services/fcmService");

/**
 * @desc    Create Assignment
 * @route   POST /api/assignments
 * @access  Private (Faculty, Admin)
 */
const createAssignment = async (req, res, next) => {
    try {
        const { title, description, subject, department, semester, division, deadline, maxMarks } = req.body;

        const attachmentUrl = req.file ? `/uploads/assignments/${req.file.filename}` : "";

        const assignment = await Assignment.create({
            title,
            description: description || "",
            subject,
            department,
            semester: Number(semester),
            division: division || "A",
            uploadedBy: req.user._id,
            attachmentUrl,
            deadline: new Date(deadline),
            maxMarks: maxMarks ? Number(maxMarks) : 100
        });

        // Broadcast FCM Push Alert
        await sendTopicNotification(
            "students",
            "New Assignment Posted 📝",
            `New assignment "${title}" for ${subject}. Deadline: ${new Date(deadline).toLocaleDateString()}`
        );

        res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            assignment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Assignments List
 * @route   GET /api/assignments
 * @access  Private
 */
const getAssignments = async (req, res, next) => {
    try {
        const { department, semester, subject } = req.query;

        let query = {};
        if (department) query.department = department;
        if (semester) query.semester = Number(semester);
        if (subject) query.subject = subject;

        const assignments = await Assignment.find(query)
            .populate("uploadedBy", "name employeeId email")
            .sort({ deadline: 1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit Assignment Solution
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
const submitAssignment = async (req, res, next) => {
    try {
        const assignmentId = req.params.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload your assignment solution file"
            });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        const fileUrl = `/uploads/assignments/${req.file.filename}`;
        const isLate = new Date() > new Date(assignment.deadline);

        let submission = await Submission.findOne({
            assignment: assignmentId,
            student: req.user._id
        });

        if (submission) {
            submission.fileUrl = fileUrl;
            submission.submittedAt = new Date();
            submission.status = isLate ? "LATE" : "SUBMITTED";
            await submission.save();
        } else {
            submission = await Submission.create({
                assignment: assignmentId,
                student: req.user._id,
                fileUrl,
                status: isLate ? "LATE" : "SUBMITTED"
            });
        }

        res.status(200).json({
            success: true,
            message: isLate ? "Assignment submitted (Late)" : "Assignment submitted successfully",
            submission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Grade Assignment Submission
 * @route   POST /api/assignments/submission/:submissionId/grade
 * @access  Private (Faculty, Admin)
 */
const gradeSubmission = async (req, res, next) => {
    try {
        const { obtainedMarks, feedback } = req.body;

        const submission = await Submission.findById(req.params.submissionId).populate("student");
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        submission.obtainedMarks = Number(obtainedMarks);
        submission.feedback = feedback || "";
        submission.status = "GRADED";
        await submission.save();

        if (submission.student && submission.student.fcmToken) {
            await sendPushNotification(
                submission.student.fcmToken,
                "Assignment Graded 🌟",
                `Your assignment submission has been graded: ${obtainedMarks} marks`,
                { type: "Assignment" },
                submission.student._id
            );
        }

        res.status(200).json({
            success: true,
            message: "Submission graded successfully",
            submission
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get All Submissions for an Assignment
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (Faculty, Admin)
 */
const getSubmissionsForAssignment = async (req, res, next) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.id })
            .populate("student", "name enrollmentNo rollNo branch semester")
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    submitAssignment,
    gradeSubmission,
    getSubmissionsForAssignment
};

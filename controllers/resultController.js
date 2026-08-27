const Result = require("../models/Result");
const Student = require("../models/Student");
const { sendPushNotification } = require("../services/fcmService");

/**
 * @desc    Upload / Create Result (Supports single result or array batch)
 * @route   POST /api/results/upload
 * @access  Private (Faculty, Admin)
 */
const uploadResult = async (req, res, next) => {
    try {
        const payload = Array.isArray(req.body) ? req.body : [req.body];

        if (payload.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Payload cannot be empty"
            });
        }

        for (const item of payload) {
            const { studentId, student, semester, examType, subjects, sgpa, cgpa, isPublished } = item;
            const targetStudentId = studentId || student;

            if (!targetStudentId || !semester || !subjects || !Array.isArray(subjects)) {
                continue;
            }

            const studentDoc = await Student.findById(targetStudentId);
            if (!studentDoc) continue;

            let grandTotalObtained = 0;
            let grandTotalMax = 0;

            const processedSubjects = subjects.map((sub) => {
                const intM = Number(sub.internalMarks || 0);
                const extM = Number(sub.externalMarks || 0);
                const total = sub.totalMarks ? Number(sub.totalMarks) : intM + extM;
                const maxM = Number(sub.maxMarks || 100);

                grandTotalObtained += total;
                grandTotalMax += maxM;

                return {
                    subjectCode: sub.subjectCode || "",
                    subjectName: sub.subjectName,
                    internalMarks: intM,
                    externalMarks: extM,
                    totalMarks: total,
                    maxMarks: maxM,
                    grade: sub.grade || (total >= 40 ? "PASS" : "FAIL")
                };
            });

            const overallPct = grandTotalMax > 0 ? (grandTotalObtained / grandTotalMax) * 100 : 0;

            let result = await Result.findOne({
                student: targetStudentId,
                semester,
                examType: examType || "Final"
            });

            if (result) {
                result.subjects = processedSubjects;
                result.sgpa = sgpa !== undefined ? sgpa : result.sgpa;
                result.cgpa = cgpa !== undefined ? cgpa : result.cgpa;
                result.percentage = parseFloat(overallPct.toFixed(2));
                result.isPublished = isPublished !== undefined ? isPublished : result.isPublished;
                await result.save();
            } else {
                result = await Result.create({
                    student: targetStudentId,
                    semester,
                    examType: examType || "Final",
                    subjects: processedSubjects,
                    sgpa: sgpa || 0,
                    cgpa: cgpa || 0,
                    percentage: parseFloat(overallPct.toFixed(2)),
                    isPublished: isPublished || false
                });
            }

            if (result.isPublished && studentDoc.fcmToken) {
                await sendPushNotification(
                    studentDoc.fcmToken,
                    "Result Published 🎓",
                    `Your Semester ${semester} exam result for ${examType || "Final"} has been published.`,
                    { type: "Result" },
                    studentDoc._id
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Results uploaded successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Publish / Unpublish Result Entry
 * @route   PATCH /api/results/:id/publish
 * @access  Private (Admin, Faculty)
 */
const publishResult = async (req, res, next) => {
    try {
        const result = await Result.findById(req.params.id).populate("student");
        if (!result) {
            return res.status(404).json({ success: false, message: "Result record not found" });
        }

        result.isPublished = true;
        result.publishedDate = new Date();
        await result.save();

        if (result.student && result.student.fcmToken) {
            await sendPushNotification(
                result.student.fcmToken,
                "Result Published 🎓",
                `Your Semester ${result.semester} result has been published!`,
                { type: "Result" },
                result.student._id
            );
        }

        res.status(200).json({
            success: true,
            message: "Result published successfully",
            result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get All Results (with filters & search)
 * @route   GET /api/results/all
 * @access  Private (Faculty, Admin)
 */
const getAllResults = async (req, res, next) => {
    try {
        const { semester, examType, isPublished, page = 1, limit = 50 } = req.query;

        let query = {};
        if (semester) query.semester = Number(semester);
        if (examType) query.examType = examType;
        if (isPublished !== undefined) query.isPublished = isPublished === "true";

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Result.countDocuments(query);

        const results = await Result.find(query)
            .populate("student", "name enrollmentNo branch department semester")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            count: results.length,
            results
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Student Results
 * @route   GET /api/results/student/:studentId
 * @access  Private
 */
const getStudentResults = async (req, res, next) => {
    try {
        let studentId = req.params.studentId;
        if (!studentId || studentId === "me") {
            studentId = req.user._id.toString();
        }

        // Students can only view their own results
        if (req.userRole === "student" && req.user._id.toString() !== studentId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own results."
            });
        }

        let query = { student: studentId };
        if (req.userRole === "student") {
            query.isPublished = true;
        }

        const results = await Result.find(query)
            .populate("student", "name enrollmentNo branch semester")
            .sort({ semester: 1 });

        res.status(200).json({
            success: true,
            count: results.length,
            results: results
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Root Results endpoint - dynamically serves student results or all results
 * @route   GET /api/results or GET /api/result
 * @access  Private
 */
const getRootResults = async (req, res, next) => {
    try {
        if (req.userRole === "student") {
            req.params.studentId = req.user._id.toString();
            return getStudentResults(req, res, next);
        }
        return getAllResults(req, res, next);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete Result
 * @route   DELETE /api/results/:id
 * @access  Private (Admin, Faculty)
 */
const deleteResult = async (req, res, next) => {
    try {
        const result = await Result.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: "Result not found" });
        }
        await result.deleteOne();
        res.status(200).json({ success: true, message: "Result deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadResult,
    publishResult,
    getAllResults,
    getStudentResults,
    getRootResults,
    deleteResult
};

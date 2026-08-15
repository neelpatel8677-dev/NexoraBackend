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
 * @desc    Get Student Results
 * @route   GET /api/results/student/:studentId
 * @access  Private
 */
const getStudentResults = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        let query = { student: studentId };
        if (req.userRole === "student") {
            query.isPublished = true;
        }

        const results = await Result.find(query)
            .populate("student", "name enrollmentNo branch semester")
            .sort({ semester: 1 });

        // Directly return list matching Retrofit Call<List<Result>>
        res.status(200).json(results);
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
    getStudentResults,
    deleteResult
};

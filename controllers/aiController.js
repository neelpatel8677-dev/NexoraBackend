const ChatHistory = require("../models/ChatHistory");
const AIReport = require("../models/AIReport");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const { generateChatResponse, analyzeStudentPerformance } = require("../services/aiService");

/**
 * @desc    Gemini AI Chat Assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
const handleChat = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Please provide a prompt/question" });
        }

        const userId = req.user._id;
        const userRole = req.userRole;

        let historyDoc = await ChatHistory.findOne({ user: userId });
        const existingMessages = historyDoc ? historyDoc.messages : [];

        // Generate response from Gemini API service
        const aiAnswer = await generateChatResponse(prompt, existingMessages, userRole);

        if (!historyDoc) {
            historyDoc = await ChatHistory.create({
                user: userId,
                role: userRole,
                messages: [
                    { sender: "user", text: prompt },
                    { sender: "model", text: aiAnswer }
                ]
            });
        } else {
            historyDoc.messages.push({ sender: "user", text: prompt });
            historyDoc.messages.push({ sender: "model", text: aiAnswer });
            await historyDoc.save();
        }

        res.status(200).json({
            success: true,
            reply: aiAnswer,
            history: historyDoc.messages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get AI Chat History
 * @route   GET /api/ai/chat/history
 * @access  Private
 */
const getChatHistory = async (req, res, next) => {
    try {
        const historyDoc = await ChatHistory.findOne({ user: req.user._id });
        res.status(200).json({
            success: true,
            messages: historyDoc ? historyDoc.messages : []
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear AI Chat History
 * @route   DELETE /api/ai/chat/history
 * @access  Private
 */
const clearChatHistory = async (req, res, next) => {
    try {
        await ChatHistory.deleteOne({ user: req.user._id });
        res.status(200).json({
            success: true,
            message: "Chat history cleared successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate / Get Student AI Performance Analysis & Risk Prediction
 * @route   GET /api/ai/reports/student/:studentId
 * @access  Private
 */
const getStudentAIReport = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Fetch attendance stats & exam results for deep AI analysis
        const attendanceDocs = await Attendance.find({ "records.student": studentId });
        let totalClasses = attendanceDocs.length;
        let presentCount = 0;
        attendanceDocs.forEach((doc) => {
            const rec = doc.records.find((r) => r.student.toString() === studentId.toString());
            if (rec && rec.status === "Present") presentCount++;
        });

        const overallPct = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : "0.00";
        const attendanceSummary = { overallPercentage: `${overallPct}%`, totalClasses, absentCount: totalClasses - presentCount };

        const results = await Result.find({ student: studentId, isPublished: true });

        // Run Gemini AI Risk Prediction analysis
        const analysisData = await analyzeStudentPerformance(student, attendanceSummary, results);

        let report = await AIReport.findOne({ student: studentId });
        if (report) {
            report.academicRisk = analysisData.academicRisk;
            report.attendanceTrend = analysisData.attendanceTrend;
            report.weakSubjects = analysisData.weakSubjects;
            report.recommendations = analysisData.recommendations;
            report.studyPlan = analysisData.studyPlan;
            report.generatedAt = new Date();
            await report.save();
        } else {
            report = await AIReport.create({
                student: studentId,
                academicRisk: analysisData.academicRisk,
                attendanceTrend: analysisData.attendanceTrend,
                weakSubjects: analysisData.weakSubjects,
                recommendations: analysisData.recommendations,
                studyPlan: analysisData.studyPlan
            });
        }

        res.status(200).json({
            success: true,
            report
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleChat,
    getChatHistory,
    clearChatHistory,
    getStudentAIReport
};

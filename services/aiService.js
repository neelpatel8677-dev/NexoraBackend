const { aiClient } = require("../config/aiConfig");

/**
 * Generate AI Chat Response using Google Gemini API
 * @param {string} prompt - User question
 * @param {Array} history - Past chat messages [{ role: 'user'|'model', text }]
 * @param {string} userRole - 'student' | 'faculty'
 * @returns {Promise<string>} AI Generated Answer
 */
const generateChatResponse = async (prompt, history = [], userRole = "student") => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return `[Nexora AI Offline]: Thank you for your question regarding "${prompt}". Please configure GEMINI_API_KEY in backend .env to enable live AI responses.`;
        }

        const systemInstruction = userRole === "student"
            ? "You are Nexora AI, a friendly expert academic tutor for university students. Help with study concepts, exam guidance, and learning strategies concisely."
            : "You are Nexora AI, an executive assistant for university faculty and administrators. Assist with curriculum planning, analytics interpretation, and academic administration.";

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: `${systemInstruction}\nUser Question: ${prompt}` }] }
            ]
        });

        return response.text || "Sorry, I could not process your request at this moment.";
    } catch (error) {
        console.error("Gemini AI API Error:", error.message);
        return `I am currently experiencing connectivity issues. Please try again shortly. (${error.message})`;
    }
};

/**
 * Generate AI Performance Risk & Study Plan Analysis
 */
const analyzeStudentPerformance = async (studentInfo, attendanceSummary, results) => {
    try {
        const prompt = `
Analyze the following student data and provide an academic performance report in JSON format:
Student: ${studentInfo.name} (Branch: ${studentInfo.branch}, Semester: ${studentInfo.semester})
Attendance Stats: Overall ${attendanceSummary.overallPercentage}, Total Classes: ${attendanceSummary.totalClasses}, Absent: ${attendanceSummary.absentCount}
Exam Results: ${JSON.stringify(results)}

Output JSON schema required:
{
  "academicRisk": "LOW" | "MEDIUM" | "HIGH",
  "attendanceTrend": "string summary",
  "weakSubjects": ["subject1", "subject2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "studyPlan": "personalized daily/weekly study plan"
}
`;

        if (!process.env.GEMINI_API_KEY) {
            // Smart Fallback calculation
            const overallPct = parseFloat(attendanceSummary.overallPercentage || 0);
            const isHighRisk = overallPct < 75;
            return {
                academicRisk: isHighRisk ? "HIGH" : "LOW",
                attendanceTrend: isHighRisk ? "Attendance is below mandatory 75% threshold." : "Satisfactory attendance record.",
                weakSubjects: results.flatMap(r => r.subjects.filter(s => (s.marksObtained / s.maxMarks) < 0.5).map(s => s.subjectName)),
                recommendations: [
                    "Maintain 75%+ attendance across all subjects.",
                    "Focus additional study hours on subjects scoring below 50%."
                ],
                studyPlan: "Allocate 2 hours daily for core engineering/degree subjects and revise weekly lecture notes."
            };
        }

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        try {
            const cleanText = response.text.replace(/```json|```/g, "").trim();
            return JSON.parse(cleanText);
        } catch {
            return {
                academicRisk: "MEDIUM",
                attendanceTrend: "Analysis complete.",
                weakSubjects: [],
                recommendations: [response.text],
                studyPlan: "Review course syllabus regularly."
            };
        }
    } catch (error) {
        console.error("AI Analysis Error:", error.message);
        return {
            academicRisk: "LOW",
            attendanceTrend: "Automated analysis unavailable",
            weakSubjects: [],
            recommendations: ["Keep up good academic habits."],
            studyPlan: "Standard curriculum study path."
        };
    }
};

module.exports = { generateChatResponse, analyzeStudentPerformance };

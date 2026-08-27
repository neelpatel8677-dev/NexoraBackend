const { genAI } = require("../config/aiConfig");
const { nexoraTools, executeTool } = require("./aiTools");

/**
 * Generate AI Chat Response using Google Gemini API with Tool Calling
 * @param {string} prompt - User question
 * @param {Array} history - Past chat messages [{ sender: 'user'|'model', text }]
 * @param {string} userRole - 'student' | 'faculty'
 * @param {string} userId - Auth user ID
 * @returns {Promise<string>} AI Generated Answer
 */
const generateChatResponse = async (prompt, history = [], userRole = "student", userId) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy_key") {
            return `[Nexora AI Offline]: Please configure a valid GEMINI_API_KEY in the environment to enable live AI responses.`;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: userRole === "student"
                ? "You are Nexora AI, a friendly expert academic tutor for university students. You have access to the student's Nexora profile, attendance, and results. Use them when asked. Be concise and helpful."
                : "You are Nexora AI, an executive assistant for faculty. You can help with class management, performance analysis, and administrative tasks using Nexora data. Be professional."
        });

        // Convert history to Gemini format
        const geminiHistory = history.map(msg => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: geminiHistory,
            tools: [{ functionDeclarations: nexoraTools }]
        });

        let result = await chat.sendMessage(prompt);
        let response = result.response;

        // Handle Function Calling
        const candidate = response.candidates[0];
        const call = candidate.content.parts.find(p => p.functionCall);

        if (call) {
            const toolResult = await executeTool(call.functionCall, userId, userRole);

            // Send tool result back to model to get final response
            result = await chat.sendMessage([{
                functionResponse: {
                    name: call.functionCall.name,
                    response: toolResult
                }
            }]);
            response = result.response;
        }

        return response.text();
    } catch (error) {
        console.error("Gemini AI API Error:", error);
        return `I encountered an issue processing your request. Please try again. (${error.message})`;
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

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy_key") {
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;

        try {
            const cleanText = response.text().replace(/```json|```/g, "").trim();
            return JSON.parse(cleanText);
        } catch {
            return {
                academicRisk: "MEDIUM",
                attendanceTrend: "Analysis complete.",
                weakSubjects: [],
                recommendations: [response.text()],
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

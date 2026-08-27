const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Assignment = require("../models/Assignment");
const Notification = require("../models/Notification");

/**
 * Tool Definitions for Gemini AI
 */
const nexoraTools = [
    {
        name: "getMyProfile",
        description: "Retrieve the profile details of the currently authenticated student.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "getMyAttendance",
        description: "Retrieve the attendance summary for the authenticated student.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "getMyResults",
        description: "Retrieve all published academic results for the authenticated student.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "getMyAssignments",
        description: "Retrieve pending and past assignments for the authenticated student.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "getFacultyProfile",
        description: "Retrieve the profile details of the currently authenticated faculty member.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "getAuthorizedStudents",
        description: "Get a list of students in a specific department and semester.",
        parameters: {
            type: "object",
            properties: {
                department: { type: "string", description: "The department name" },
                semester: { type: "number", description: "The semester number" }
            },
            required: ["department", "semester"]
        }
    },
    {
        name: "createAssignment",
        description: "Create a new assignment for students. Requires title, subject, semester, and deadline.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string" },
                subject: { type: "string" },
                semester: { type: "number" },
                deadline: { type: "string", description: "ISO date string" },
                description: { type: "string" }
            },
            required: ["title", "subject", "semester", "deadline"]
        }
    }
];

/**
 * Tool Implementations
 */
const toolHandlers = {
    getMyProfile: async (userId) => {
        const student = await Student.findById(userId).select("-password");
        return student || { error: "Student profile not found." };
    },

    getMyAttendance: async (userId) => {
        const attendanceDocs = await Attendance.find({ "records.student": userId });
        const total = attendanceDocs.length;
        let present = 0;
        attendanceDocs.forEach(doc => {
            const rec = doc.records.find(r => r.student.toString() === userId.toString());
            if (rec && rec.status === "Present") present++;
        });
        const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
        return {
            totalClasses: total,
            presentCount: present,
            absentCount: total - present,
            overallPercentage: `${percentage}%`
        };
    },

    getMyResults: async (userId) => {
        const results = await Result.find({ student: userId, isPublished: true }).sort({ semester: 1 });
        return results.length > 0 ? results : { message: "No results published yet." };
    },

    getMyAssignments: async (userId) => {
        const student = await Student.findById(userId);
        if (!student) return { error: "Student not found." };
        const assignments = await Assignment.find({
            department: student.department,
            semester: student.semester
        }).sort({ deadline: 1 });
        return assignments;
    },

    getFacultyProfile: async (userId) => {
        const faculty = await Faculty.findById(userId).select("-password");
        return faculty || { error: "Faculty profile not found." };
    },

    getAuthorizedStudents: async (userId, args) => {
        const students = await Student.find({
            department: args.department,
            semester: args.semester
        }).select("name enrollmentNo rollNo branch");
        return students;
    },

    createAssignment: async (userId, args) => {
        const faculty = await Faculty.findById(userId);
        if (!faculty) return { error: "Faculty not authorized." };

        const assignment = await Assignment.create({
            title: args.title,
            description: args.description || "",
            subject: args.subject,
            department: faculty.department,
            semester: args.semester,
            uploadedBy: userId,
            deadline: new Date(args.deadline),
            maxMarks: 100
        });

        // Add a notification entry
        await Notification.create({
            user: userId, // Logged as faculty action, usually you'd notify students here
            title: "AI Created Assignment",
            message: `New assignment ${args.title} created via Nexora AI.`,
            type: "Assignment"
        });

        return { success: true, assignmentId: assignment._id, message: "Assignment created successfully." };
    }
};

/**
 * Executes a tool call from Gemini
 */
const executeTool = async (toolCall, userId, userRole) => {
    const { name, args } = toolCall;

    // Authorization Check
    const facultyOnlyTools = ["getAuthorizedStudents", "createAssignment", "getFacultyProfile"];
    if (userRole === "student" && facultyOnlyTools.includes(name)) {
        return { error: `Unauthorized: Students cannot access ${name}` };
    }

    if (toolHandlers[name]) {
        try {
            return await toolHandlers[name](userId, args);
        } catch (error) {
            console.error(`Tool Execution Error (${name}):`, error);
            return { error: `Failed to execute ${name}: ${error.message}` };
        }
    }

    return { error: `Tool ${name} not found.` };
};

module.exports = { nexoraTools, executeTool };

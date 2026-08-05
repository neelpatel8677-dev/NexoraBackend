const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Note = require("../models/Note");
const Assignment = require("../models/Assignment");
const Notice = require("../models/Notice");

/**
 * @desc    Global Search API across Students, Faculty, Notes, Assignments, and Notices
 * @route   GET /api/search
 * @access  Private
 */
const globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please enter a search keyword (?q=query)"
            });
        }

        const searchRegex = new RegExp(q, "i");

        const [students, faculty, notes, assignments, notices] = await Promise.all([
            Student.find({
                $or: [
                    { name: searchRegex },
                    { enrollmentNo: searchRegex },
                    { email: searchRegex },
                    { department: searchRegex }
                ]
            }).select("name enrollmentNo email department branch semester profileImage"),

            Faculty.find({
                $or: [
                    { name: searchRegex },
                    { employeeId: searchRegex },
                    { department: searchRegex },
                    { email: searchRegex }
                ]
            }).select("name employeeId email department designation profileImage"),

            Note.find({
                $or: [{ title: searchRegex }, { subject: searchRegex }]
            }).select("title subject fileType fileSize fileUrl createdAt"),

            Assignment.find({
                $or: [{ title: searchRegex }, { subject: searchRegex }, { description: searchRegex }]
            }).select("title subject deadline maxMarks attachmentUrl"),

            Notice.find({
                $or: [{ title: searchRegex }, { content: searchRegex }]
            }).select("title category targetAudience createdAt")
        ]);

        res.status(200).json({
            success: true,
            query: q,
            results: {
                students,
                faculty,
                notes,
                assignments,
                notices
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { globalSearch };

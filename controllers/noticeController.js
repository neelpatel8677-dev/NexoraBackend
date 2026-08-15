const Notice = require("../models/Notice");
const { sendTopicNotification } = require("../services/fcmService");

/**
 * @desc    Create Campus Notice
 * @route   POST /api/notices
 * @access  Private (Faculty, Admin)
 */
const createNotice = async (req, res, next) => {
    try {
        const { title, content, category, department, semester, targetAudience } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Please provide both title and content for the notice"
            });
        }

        const attachment = req.file ? `/uploads/${req.file.filename}` : "";

        const notice = await Notice.create({
            title,
            content,
            category: category || "General",
            department: department || "",
            semester: semester ? Number(semester) : null,
            targetAudience: targetAudience || "All",
            createdBy: req.user ? (req.user.name || "Admin") : "Admin",
            attachment
        });

        // Broadcast notification if FCM service is configured
        if (typeof sendTopicNotification === "function") {
            const topic = targetAudience === "Faculty" ? "faculty" : "students";
            sendTopicNotification(
                topic,
                `📢 New Notice: ${title}`,
                content.substring(0, 100) + "..."
            ).catch((err) => console.error("FCM Topic Notification Error:", err.message));
        }

        res.status(201).json({
            success: true,
            message: "Notice published successfully",
            notice
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get / Search Notices
 * @route   GET /api/notices
 * @access  Private
 */
const getNotices = async (req, res, next) => {
    try {
        const { category, department, search } = req.query;

        let query = {};
        if (category) query.category = category;
        if (department) query.department = department;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        const userRole = req.userRole;
        if (userRole === "student") {
            query.targetAudience = { $in: ["All", "Student"] };
        } else if (userRole === "faculty") {
            query.targetAudience = { $in: ["All", "Faculty"] };
        }

        const notices = await Notice.find(query).sort({ createdAt: -1 });

        res.status(200).json(notices);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete Notice
 * @route   DELETE /api/notices/:id
 * @access  Private (Faculty, Admin)
 */
const deleteNotice = async (req, res, next) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }

        await notice.deleteOne();
        res.status(200).json({ success: true, message: "Notice deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNotice,
    getNotices,
    deleteNotice
};

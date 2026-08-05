const Note = require("../models/Note");
const path = require("path");
const { sendTopicNotification } = require("../services/fcmService");

/**
 * @desc    Upload Study Note
 * @route   POST /api/notes
 * @access  Private (Faculty, Admin)
 */
const uploadNote = async (req, res, next) => {
    try {
        const { title, subject, department, semester } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a file to upload (PDF, DOCX, PPT, ZIP, or Image)"
            });
        }

        const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
        let fileType = "PDF";
        if (["docx", "doc"].includes(ext)) fileType = "DOCX";
        else if (["ppt", "pptx"].includes(ext)) fileType = "PPT";
        else if (["zip"].includes(ext)) fileType = "ZIP";
        else if (["jpg", "jpeg", "png", "webp"].includes(ext)) fileType = "IMAGE";

        const filePath = `/uploads/notes/${req.file.filename}`;

        const note = await Note.create({
            title,
            subject,
            department,
            semester: Number(semester),
            uploadedBy: req.user._id,
            fileUrl: filePath,
            fileType,
            fileSize: req.file.size
        });

        // Broadcast FCM alert
        await sendTopicNotification(
            "students",
            "New Study Material Uploaded 📚",
            `New note "${title}" uploaded for ${subject} (Sem ${semester})`
        );

        res.status(201).json({
            success: true,
            message: "Study material uploaded successfully",
            note
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get / Search Notes
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res, next) => {
    try {
        const { department, semester, subject, search } = req.query;

        let query = {};
        if (department) query.department = department;
        if (semester) query.semester = Number(semester);
        if (subject) query.subject = subject;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ];
        }

        const notes = await Note.find(query)
            .populate("uploadedBy", "name employeeId email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notes.length,
            notes
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download Note & Increment Download Count
 * @route   GET /api/notes/:id/download
 * @access  Private
 */
const downloadNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note file not found" });
        }

        note.downloadsCount += 1;
        await note.save();

        const absolutePath = path.join(__dirname, "..", note.fileUrl);
        res.download(absolutePath, `${note.title}.${note.fileType.toLowerCase()}`);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete Note
 * @route   DELETE /api/notes/:id
 * @access  Private (Faculty, Admin)
 */
const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        await note.deleteOne();
        res.status(200).json({ success: true, message: "Note deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadNote,
    getNotes,
    downloadNote,
    deleteNote
};

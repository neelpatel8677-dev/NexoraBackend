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
        const { title, subject, department, semester, description } = req.body;

        let fileType = "NOTE";
        let filePath = "";
        let fileSize = 0;

        if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
            if (["docx", "doc"].includes(ext)) fileType = "DOCX";
            else if (["ppt", "pptx"].includes(ext)) fileType = "PPT";
            else if (["zip"].includes(ext)) fileType = "ZIP";
            else if (["jpg", "jpeg", "png", "webp"].includes(ext)) fileType = "IMAGE";
            else fileType = "PDF";

            filePath = `/uploads/notes/${req.file.filename}`;
            fileSize = req.file.size;
        }

        const note = await Note.create({
            title,
            description: description || "",
            subject,
            department: department || "",
            semester: semester ? Number(semester) : 1,
            uploadedBy: req.user._id,
            fileUrl: filePath,
            fileType,
            fileSize
        });

        await sendTopicNotification(
            "students",
            "New Study Material Uploaded 📚",
            `New note "${title}" uploaded for ${subject}`
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
        if (subject) query.subject = { $regex: subject, $options: "i" };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ];
        }

        const notes = await Note.find(query)
            .populate("uploadedBy", "name employeeId email")
            .sort({ createdAt: -1 });

        // Directly return list matching Retrofit Call<List<Note>>
        res.status(200).json(notes);
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

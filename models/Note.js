const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Note title is required"],
            trim: true
        },
        subject: {
            type: String,
            required: [true, "Subject name is required"],
            trim: true
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"]
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },
        fileUrl: {
            type: String,
            required: [true, "File path is required"]
        },
        fileType: {
            type: String,
            enum: ["PDF", "DOCX", "PPT", "ZIP", "IMAGE"],
            default: "PDF"
        },
        fileSize: {
            type: Number,
            default: 0
        },
        downloadsCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Note", NoteSchema);

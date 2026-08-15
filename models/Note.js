const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Note title is required"],
            trim: true
        },
        description: {
            type: String,
            default: "",
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
            default: ""
        },
        fileType: {
            type: String,
            enum: ["PDF", "DOCX", "DOC", "PPT", "PPTX", "ZIP", "IMAGE", "TXT", "NOTE", "OTHER"],
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
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

module.exports = mongoose.model("Note", NoteSchema);

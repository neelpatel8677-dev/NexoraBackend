const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Assignment title is required"],
            trim: true
        },
        description: {
            type: String,
            default: ""
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
        division: {
            type: String,
            default: "A"
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },
        attachmentUrl: {
            type: String,
            default: ""
        },
        deadline: {
            type: Date,
            required: [true, "Assignment deadline date is required"]
        },
        maxMarks: {
            type: Number,
            default: 100
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);

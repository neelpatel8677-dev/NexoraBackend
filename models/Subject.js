const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        subjectCode: {
            type: String,
            required: [true, "Subject Code is required"],
            unique: true,
            uppercase: true,
            trim: true
        },
        subjectName: {
            type: String,
            required: [true, "Subject Name is required"],
            trim: true
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: 1,
            max: 10
        },
        credits: {
            type: Number,
            required: [true, "Credits count is required"],
            default: 4
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true
        },
        assignedFaculty: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Faculty"
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

SubjectSchema.index({ department: 1, semester: 1 });

module.exports = mongoose.model("Subject", SubjectSchema);

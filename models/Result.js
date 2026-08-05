const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"]
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"]
        },
        examType: {
            type: String,
            enum: ["Midterm", "Final", "Class Test"],
            default: "Final"
        },
        subjects: [
            {
                subjectCode: {
                    type: String,
                    default: ""
                },
                subjectName: {
                    type: String,
                    required: true,
                    trim: true
                },
                internalMarks: {
                    type: Number,
                    default: 0
                },
                externalMarks: {
                    type: Number,
                    default: 0
                },
                totalMarks: {
                    type: Number,
                    default: 0
                },
                maxMarks: {
                    type: Number,
                    default: 100
                },
                grade: {
                    type: String,
                    default: "A"
                }
            }
        ],
        sgpa: {
            type: Number,
            default: 0
        },
        cgpa: {
            type: Number,
            default: 0
        },
        percentage: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        publishedDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Result", ResultSchema);

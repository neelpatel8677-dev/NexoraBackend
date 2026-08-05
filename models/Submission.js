const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        fileUrl: {
            type: String,
            required: [true, "Submission file is required"]
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        obtainedMarks: {
            type: Number,
            default: null
        },
        feedback: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["SUBMITTED", "GRADED", "LATE"],
            default: "SUBMITTED"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Submission", SubmissionSchema);

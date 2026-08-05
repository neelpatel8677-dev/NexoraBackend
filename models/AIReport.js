const mongoose = require("mongoose");

const AIReportSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        academicRisk: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "LOW"
        },
        attendanceTrend: {
            type: String,
            default: ""
        },
        weakSubjects: [
            {
                type: String
            }
        ],
        recommendations: [
            {
                type: String
            }
        ],
        studyPlan: {
            type: String,
            default: ""
        },
        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("AIReport", AIReportSchema);

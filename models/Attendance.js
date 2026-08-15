const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, "Attendance date is required"],
            default: Date.now
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
        branch: {
            type: String,
            required: [true, "Branch is required"],
            trim: true
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"]
        },
        section: {
            type: String,
            default: "A",
            trim: true
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true
        },
        records: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                    required: true
                },
                status: {
                    type: String,
                    enum: ["Present", "Absent", "Late"],
                    default: "Present"
                }
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound index to optimize attendance lookups
AttendanceSchema.index({ date: 1, subject: 1, department: 1, semester: 1, section: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);

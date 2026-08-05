const mongoose = require("mongoose");

const LectureAttendanceSchema = new mongoose.Schema(
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
            default: "Computer Engineering",
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
        timeSlot: {
            type: String,
            default: "09:00 AM - 10:00 AM"
        },
        periodNumber: {
            type: Number,
            default: 1
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
        timestamps: true
    }
);

module.exports = mongoose.model("LectureAttendance", LectureAttendanceSchema);

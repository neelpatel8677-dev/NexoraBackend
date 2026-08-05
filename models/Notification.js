const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "userModel"
        },
        userModel: {
            type: String,
            default: "Student",
            enum: ["Student", "Faculty", "Admin"]
        },
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: [
                "Attendance",
                "Result",
                "Assignment",
                "Fee",
                "Timetable",
                "Notes",
                "Notice",
                "General"
            ],
            default: "General"
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notification", NotificationSchema);

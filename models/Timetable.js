const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema(
    {
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: 1,
            max: 10
        },
        section: {
            type: String,
            default: "A",
            trim: true
        },
        dayOfWeek: {
            type: String,
            required: [true, "Day of week is required"],
            trim: true
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        slots: [
            {
                timeSlot: {
                    type: String,
                    required: true
                },
                subject: {
                    type: String,
                    required: true
                },
                facultyName: {
                    type: String,
                    default: ""
                },
                facultyId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Faculty",
                    default: null
                },
                roomNo: {
                    type: String,
                    default: "Lab 1"
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

TimetableSchema.index({ department: 1, semester: 1, section: 1, dayOfWeek: 1 });

module.exports = mongoose.model("Timetable", TimetableSchema);

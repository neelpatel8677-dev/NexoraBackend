const mongoose = require("mongoose");

const TimetableImageSchema = new mongoose.Schema(
    {
        department: {
            type: String,
            required: true,
            trim: true
        },
        semester: {
            type: Number,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("TimetableImage", TimetableImageSchema);

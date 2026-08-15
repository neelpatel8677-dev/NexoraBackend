const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Notice title is required"],
            trim: true
        },
        content: {
            type: String,
            required: [true, "Notice content is required"]
        },
        category: {
            type: String,
            default: "General",
            trim: true
        },
        department: {
            type: String,
            default: ""
        },
        semester: {
            type: Number,
            default: null
        },
        targetAudience: {
            type: String,
            default: "All",
            trim: true
        },
        createdBy: {
            type: String,
            required: true,
            default: "Admin"
        },
        attachment: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

NoticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notice", NoticeSchema);

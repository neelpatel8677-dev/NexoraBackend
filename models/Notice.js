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
            enum: ["College", "Department", "General", "Class"],
            default: "General"
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
            enum: ["All", "Student", "Faculty"],
            default: "All"
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
        timestamps: true
    }
);

module.exports = mongoose.model("Notice", NoticeSchema);

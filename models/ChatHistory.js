const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        role: {
            type: String,
            enum: ["student", "faculty", "admin"],
            required: true
        },
        messages: [
            {
                sender: {
                    type: String,
                    enum: ["user", "model"],
                    required: true
                },
                text: {
                    type: String,
                    required: true
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        tokenUsage: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);

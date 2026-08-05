const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "userModel"
        },
        userModel: {
            type: String,
            required: true,
            enum: ["Student", "Faculty", "Admin"]
        },
        token: {
            type: String,
            required: true,
            unique: true
        },
        deviceInfo: {
            type: String,
            default: "Android Device"
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// TTL index to automatically delete expired refresh tokens from MongoDB
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);

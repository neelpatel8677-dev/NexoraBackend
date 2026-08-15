const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const FacultySchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: [true, "Faculty name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        role: {
            type: String,
            default: "faculty",
            enum: ["faculty"]
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true
        },
        designation: {
            type: String,
            default: "Assistant Professor",
            trim: true
        },
        phone: {
            type: String,
            default: ""
        },
        subjects: [
            {
                type: String,
                trim: true
            }
        ],
        profileImage: {
            type: String,
            default: ""
        },
        fcmToken: {
            type: String,
            default: ""
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

FacultySchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

FacultySchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

FacultySchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model("Faculty", FacultySchema);

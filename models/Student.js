const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const StudentSchema = new mongoose.Schema(
    {
        enrollmentNo: {
            type: String,
            required: [true, "Enrollment number is required"],
            unique: true,
            trim: true
        },
        rollNo: {
            type: String,
            default: "",
            trim: true
        },
        name: {
            type: String,
            required: [true, "Student name is required"],
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
            default: "student",
            enum: ["student"]
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
            required: [true, "Semester is required"],
            min: 1,
            max: 10
        },
        division: {
            type: String,
            default: "A",
            trim: true
        },
        section: {
            type: String,
            default: "A",
            trim: true
        },
        phone: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        guardian: {
            name: { type: String, default: "" },
            phone: { type: String, default: "" },
            email: { type: String, default: "" },
            relation: { type: String, default: "Parent" }
        },
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

StudentSchema.index({ department: 1, semester: 1, division: 1 });

StudentSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

StudentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

StudentSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model("Student", StudentSchema);

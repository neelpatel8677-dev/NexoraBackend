const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin");
const RefreshToken = require("../models/RefreshToken");
const generateToken = require("../utils/generateToken");
const { sendPasswordResetEmail } = require("../services/emailService");
const crypto = require("crypto");

/**
 * Generate Access Token & Refresh Token Pair
 */
const generateTokenPair = async (user, role, res) => {
    const accessToken = generateToken(user._id, role);

    const refreshTokenString = jwt.sign(
        { id: user._id, role },
        process.env.JWT_REFRESH_SECRET || "nexora_refresh_secret_key_2026",
        { expiresIn: "7d" }
    );

    let userModel = "Student";
    if (role === "faculty") userModel = "Faculty";
    if (role === "super_admin" || role === "admin") userModel = "Admin";

    // Save refresh token in database
    await RefreshToken.create({
        user: user._id,
        userModel,
        token: refreshTokenString,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { accessToken, refreshToken: refreshTokenString };
};

/**
 * @desc    Register Student
 * @route   POST /api/auth/register/student
 * @access  Public
 */
const registerStudent = async (req, res, next) => {
    try {
        const {
            enrollmentNo,
            rollNo,
            name,
            email,
            password,
            department,
            branch,
            semester,
            division,
            section,
            phone,
            address,
            guardian,
            fcmToken
        } = req.body;

        const normalizedEmail = email ? email.toLowerCase().trim() : "";

        const existingEmail = await Student.findOne({ email: normalizedEmail }) || 
                              await Faculty.findOne({ email: normalizedEmail }) || 
                              await Admin.findOne({ email: normalizedEmail });
                              
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "This email is already in use"
            });
        }

        const existingEnrollment = await Student.findOne({ enrollmentNo });
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: "A student with this enrollment number already exists"
            });
        }

        const student = await Student.create({
            enrollmentNo,
            rollNo: rollNo || "",
            name,
            email: normalizedEmail,
            password,
            department,
            branch: branch || "Computer Engineering",
            semester: semester || 1,
            division: division || "A",
            section: section || "A",
            phone: phone || "",
            address: address || "",
            guardian: guardian || {},
            fcmToken: fcmToken || ""
        });

        const { accessToken, refreshToken } = await generateTokenPair(student, "student", res);

        const studentObj = student.toObject();
        delete studentObj.password;

        res.status(201).json({
            success: true,
            message: "Student registered successfully",
            accessToken,
            refreshToken,
            user: studentObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Register Faculty
 * @route   POST /api/auth/register/faculty
 * @access  Public (Secret Key required)
 */
const registerFaculty = async (req, res, next) => {
    try {
        const {
            employeeId,
            name,
            email,
            password,
            department,
            designation,
            phone,
            subjects,
            facultySecretKey,
            fcmToken
        } = req.body;

        const expectedSecret = process.env.FACULTY_SECRET_KEY || "NEXORAneelpatel2026";
        if (facultySecretKey !== expectedSecret) {
            return res.status(401).json({
                success: false,
                message: "Invalid Faculty Secret Key. Registration denied."
            });
        }

        const normalizedEmail = email ? email.toLowerCase().trim() : "";

        const existingEmail = await Faculty.findOne({ email: normalizedEmail }) || 
                              await Student.findOne({ email: normalizedEmail }) || 
                              await Admin.findOne({ email: normalizedEmail });
                              
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "This email is already in use"
            });
        }

        const faculty = await Faculty.create({
            employeeId,
            name,
            email: normalizedEmail,
            password,
            department,
            designation: designation || "Assistant Professor",
            phone: phone || "",
            subjects: subjects || [],
            fcmToken: fcmToken || ""
        });

        const { accessToken, refreshToken } = await generateTokenPair(faculty, "faculty", res);

        const facultyObj = faculty.toObject();
        delete facultyObj.password;

        res.status(201).json({
            success: true,
            message: "Faculty registered successfully",
            accessToken,
            refreshToken,
            user: facultyObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Unified Login (Student, Faculty, Admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password, fcmToken } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check for Fixed Super Admin
        const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@nexora.com").toLowerCase().trim();
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "admin123";

        if (normalizedEmail === superAdminEmail && password === superAdminPassword) {
            let user = await Admin.findOne({ email: superAdminEmail });

            if (!user) {
                user = await Admin.create({
                    name: "Super Admin",
                    email: superAdminEmail,
                    password: superAdminPassword,
                    role: "super_admin"
                });
            }

            if (fcmToken) {
                user.fcmToken = fcmToken;
                await user.save();
            }

            const { accessToken, refreshToken } = await generateTokenPair(user, "super_admin", res);
            const userObj = user.toObject();
            delete userObj.password;

            return res.status(200).json({
                success: true,
                message: "Super Admin Login successful",
                accessToken,
                refreshToken,
                role: "super_admin",
                user: userObj
            });
        }

        // Search in Student, Faculty, then Admin collections
        let user = await Student.findOne({ email: normalizedEmail });
        let userRole = "student";

        if (!user) {
            user = await Faculty.findOne({ email: normalizedEmail });
            userRole = "faculty";
        }

        if (!user) {
            user = await Admin.findOne({ email: normalizedEmail });
            userRole = user ? (user.role || "admin") : null;
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Account not found with this email"
            });
        }

        const isMatch = typeof user.matchPassword === "function" 
            ? await user.matchPassword(password) 
            : false;

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password. Please try again."
            });
        }

        if (fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
        }

        const { accessToken, refreshToken } = await generateTokenPair(user, userRole, res);

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
            role: userRole,
            user: userObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refresh Access Token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const storedToken = await RefreshToken.findOne({ token });
        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked refresh token"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET || "nexora_refresh_secret_key_2026"
        );

        const newAccessToken = generateToken(decoded.id, decoded.role);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Expired or invalid refresh token"
        });
    }
};

/**
 * @desc    Logout User & Revoke Refresh Token
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (token) {
            await RefreshToken.deleteOne({ token });
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email ? email.toLowerCase().trim() : "";

        let user = await Student.findOne({ email: normalizedEmail }) || 
                   await Faculty.findOne({ email: normalizedEmail }) || 
                   await Admin.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "There is no account associated with this email address"
            });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        await sendPasswordResetEmail(user.email, resetToken, user.name);

        res.status(200).json({
            success: true,
            message: "Password reset token sent to your email address",
            resetToken
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset Password with Token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        let user = await Student.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        }) || await Faculty.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        }) || await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired password reset token"
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful. You can now login with your new password."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Change Password (Authenticated User)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = req.user;

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password"
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Me User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            role: req.userRole,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload User Avatar Picture
 * @route   POST /api/auth/upload-avatar
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image file"
            });
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        req.user.profileImage = avatarPath;
        await req.user.save();

        res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            profileImage: avatarPath
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerStudent,
    registerFaculty,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    getMe,
    uploadAvatar
};

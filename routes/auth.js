const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const {
    registerStudentValidation,
    registerFacultyValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
} = require("../validators/authValidator");

// Public Auth Endpoints (Rate Limited)
router.post("/register/student", authLimiter, registerStudentValidation, registerStudent);
router.post("/register/faculty", authLimiter, registerFacultyValidation, registerFaculty);
router.post("/login", authLimiter, loginValidation, login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);

// Authenticated Auth Endpoints
router.post("/logout", protect, logout);
router.post("/change-password", protect, changePasswordValidation, changePassword);
router.get("/me", protect, getMe);
router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;

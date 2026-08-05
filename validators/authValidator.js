const { check } = require("express-validator");
const validate = require("./validate");

const registerStudentValidation = [
    check("name", "Name is required").notEmpty().trim(),
    check("email", "Please include a valid email").isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("enrollmentNo", "Enrollment number is required").notEmpty().trim(),
    check("department", "Department is required").notEmpty().trim(),
    check("semester", "Semester must be a valid number between 1 and 10").isInt({ min: 1, max: 10 }),
    validate
];

const registerFacultyValidation = [
    check("name", "Name is required").notEmpty().trim(),
    check("email", "Please include a valid email").isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    check("employeeId", "Employee ID is required").notEmpty().trim(),
    check("department", "Department is required").notEmpty().trim(),
    check("facultySecretKey", "Faculty secret key is required").notEmpty(),
    validate
];

const loginValidation = [
    check("email", "Please include a valid email").isEmail().normalizeEmail(),
    check("password", "Password is required").notEmpty(),
    validate
];

const forgotPasswordValidation = [
    check("email", "Please include a valid email").isEmail().normalizeEmail(),
    validate
];

const resetPasswordValidation = [
    check("token", "Reset token is required").notEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength({ min: 6 }),
    validate
];

const changePasswordValidation = [
    check("oldPassword", "Current password is required").notEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength({ min: 6 }),
    validate
];

module.exports = {
    registerStudentValidation,
    registerFacultyValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
};

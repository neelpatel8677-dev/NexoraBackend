const { check } = require("express-validator");
const validate = require("./validate");

const subjectValidation = [
    check("subjectCode", "Subject code is required").notEmpty().trim().toUpperCase(),
    check("subjectName", "Subject name is required").notEmpty().trim(),
    check("semester", "Semester must be a number between 1 and 10").isInt({ min: 1, max: 10 }),
    check("credits", "Credits must be a positive integer").optional().isInt({ min: 1 }),
    check("department", "Department is required").notEmpty().trim(),
    validate
];

module.exports = { subjectValidation };

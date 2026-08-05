const { check } = require("express-validator");
const validate = require("./validate");

const departmentValidation = [
    check("departmentCode", "Department code is required").notEmpty().trim().toUpperCase(),
    check("departmentName", "Department name is required").notEmpty().trim(),
    validate
];

module.exports = { departmentValidation };

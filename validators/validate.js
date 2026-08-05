const { validationResult } = require("express-validator");

/**
 * Common Validation Middleware Runner
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = validate;

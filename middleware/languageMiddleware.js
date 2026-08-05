const { translate } = require("../services/i18nService");

/**
 * Language Middleware - Attaches `req.lang` and helper `req.t(key)`
 */
const setLanguage = (req, res, next) => {
    let lang = req.query.lang || req.headers["accept-language"] || "en";

    if (lang.includes("hi")) lang = "hi";
    else if (lang.includes("gu")) lang = "gu";
    else lang = "en";

    req.lang = lang;
    req.t = (key) => translate(key, lang);
    next();
};

module.exports = setLanguage;

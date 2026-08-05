const fs = require("fs");
const path = require("path");

const locales = {};

// Load JSON locale dictionaries
const loadLocales = () => {
    const localeFiles = ["en", "hi", "gu"];
    localeFiles.forEach((lang) => {
        try {
            const filePath = path.join(__dirname, `../locales/${lang}.json`);
            if (fs.existsSync(filePath)) {
                locales[lang] = JSON.parse(fs.readFileSync(filePath, "utf8"));
            }
        } catch (err) {
            console.error(`Error loading locale file ${lang}.json:`, err.message);
        }
    });
};

loadLocales();

/**
 * Translate key into current locale text
 * @param {string} key - Dictionary key
 * @param {string} lang - Language code ('en' | 'hi' | 'gu')
 * @returns {string} Translated string
 */
const translate = (key, lang = "en") => {
    const selectedLang = locales[lang] ? lang : "en";
    return locales[selectedLang][key] || locales["en"][key] || key;
};

module.exports = { translate };

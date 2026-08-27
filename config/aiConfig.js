const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Initialize Google Gemini AI Client
 */
const apiKey = process.env.GEMINI_API_KEY || "dummy_key";
const genAI = new GoogleGenerativeAI(apiKey);

module.exports = { genAI };

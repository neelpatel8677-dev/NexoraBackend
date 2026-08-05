const { GoogleGenAI } = require("@google/genai");

/**
 * Initialize Google Gemini AI Client
 */
const apiKey = process.env.GEMINI_API_KEY || "dummy_key";
const aiClient = new GoogleGenAI({ apiKey });

module.exports = { aiClient };

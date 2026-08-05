const express = require("express");
const router = express.Router();
const {
    handleChat,
    getChatHistory,
    clearChatHistory,
    getStudentAIReport
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/chat", handleChat);
router.get("/chat/history", getChatHistory);
router.delete("/chat/history", clearChatHistory);
router.get("/reports/student/:studentId", getStudentAIReport);

module.exports = router;

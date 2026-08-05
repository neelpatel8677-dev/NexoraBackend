const express = require("express");
const router = express.Router();
const {
    getUserNotifications,
    markNotificationAsRead,
    sendDirectNotification
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getUserNotifications);
router.patch("/:id/read", markNotificationAsRead);
router.post("/send", authorize("super_admin", "admin"), sendDirectNotification);

module.exports = router;

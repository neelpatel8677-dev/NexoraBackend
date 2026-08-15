const Notification = require("../models/Notification");
const { sendPushNotification, sendTopicNotification } = require("../services/fcmService");

/**
 * @desc    Get Notifications for Current User
 * @route   GET /api/notifications
 * @access  Private
 */
const getUserNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        // Directly return list matching Retrofit Call<List<Notification>>
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark Notification as Read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send Push Notification (Admin)
 * @route   POST /api/notifications/send
 * @access  Private (Admin)
 */
const sendDirectNotification = async (req, res, next) => {
    try {
        const { targetType, target, title, body, type } = req.body;

        if (targetType === "topic") {
            await sendTopicNotification(target || "students", title, body, { type: type || "General" });
        } else {
            await sendPushNotification("", title, body, { type: type || "General" }, target);
        }

        res.status(200).json({
            success: true,
            message: "Push notification dispatched successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserNotifications,
    markNotificationAsRead,
    sendDirectNotification
};

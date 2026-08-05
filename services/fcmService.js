const { admin } = require("../config/firebase");
const Notification = require("../models/Notification");

/**
 * Send Firebase Push Notification to a single device token
 */
const sendPushNotification = async (fcmToken, title, body, data = {}, userId = null) => {
    try {
        if (userId) {
            await Notification.create({
                user: userId,
                title,
                body,
                type: data.type || "General",
                read: false
            });
        }

        if (!fcmToken || !admin.apps.length) {
            console.log(`[FCM SIMULATION] Notification to user ${userId || "Guest"}: ${title} - ${body}`);
            return { success: true, simulated: true };
        }

        const message = {
            notification: { title, body },
            data,
            token: fcmToken
        };

        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (error) {
        console.error("FCM Send Error:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Broadcast Push Notification to a Topic (e.g. 'all', 'students', 'faculty')
 */
const sendTopicNotification = async (topic, title, body, data = {}) => {
    try {
        if (!admin.apps.length) {
            console.log(`[FCM TOPIC SIMULATION] Topic '${topic}': ${title} - ${body}`);
            return { success: true, simulated: true };
        }

        const message = {
            notification: { title, body },
            data,
            topic
        };

        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (error) {
        console.error("FCM Topic Send Error:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendPushNotification, sendTopicNotification };

const admin = require("firebase-admin");

/**
 * Initialize Firebase Admin SDK for FCM Push Notifications
 */
const initFirebase = () => {
    try {
        if (!admin.apps.length) {
            const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
                ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
                : null;

            if (serviceAccount) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("✅ Firebase Admin SDK Initialized Successfully");
            } else {
                console.log("⚠️ FIREBASE_SERVICE_ACCOUNT env not provided. FCM in simulation mode.");
            }
        }
    } catch (error) {
        console.error("❌ Firebase Initialization Error:", error.message);
    }
};

module.exports = { admin, initFirebase };

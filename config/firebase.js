const admin = require("firebase-admin");

/**
 * Initialize Firebase Admin SDK for FCM Push Notifications
 */
const initFirebase = () => {
    try {
        const apps = admin.apps || (admin.default && admin.default.apps) || [];

        if (apps.length === 0) {
            let serviceAccount = null;

            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                try {
                    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === "object"
                        ? process.env.FIREBASE_SERVICE_ACCOUNT
                        : JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                } catch (parseError) {
                    console.error("⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", parseError.message);
                }
            }

            if (serviceAccount && serviceAccount.project_id) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("==================================");
                console.log("✅ Firebase Admin SDK Initialized Successfully");
                console.log("==================================");
            } else {
                console.log("==================================");
                console.log("⚠️ FIREBASE_SERVICE_ACCOUNT env not configured. FCM running in simulation mode.");
                console.log("==================================");
            }
        }
    } catch (error) {
        console.error("==================================");
        console.error("❌ Firebase Initialization Error:", error.message);
        console.error("==================================");
    }
};

module.exports = { admin, initFirebase };

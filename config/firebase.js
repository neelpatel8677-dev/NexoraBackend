const rawAdmin = require("firebase-admin");

// Handle CommonJS / ES module interop
const admin = rawAdmin.default || rawAdmin;

/**
 * Initialize Firebase Admin SDK for FCM Push Notifications
 */
const initFirebase = () => {
    try {
        const apps = admin.apps || (rawAdmin.apps) || [];

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

            if (serviceAccount && (serviceAccount.project_id || serviceAccount.projectId)) {
                // Safely resolve the credential helper
                const credentialHelper = (admin.credential && admin.credential.cert) 
                    ? admin.credential 
                    : (rawAdmin.credential && rawAdmin.credential.cert) 
                        ? rawAdmin.credential 
                        : null;

                if (credentialHelper) {
                    admin.initializeApp({
                        credential: credentialHelper.cert(serviceAccount)
                    });
                    console.log("==================================");
                    console.log("✅ Firebase Admin SDK Initialized Successfully");
                    console.log("==================================");
                } else {
                    console.log("⚠️ Firebase credential helper not accessible. FCM running in simulation mode.");
                }
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

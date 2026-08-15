const admin = require("firebase-admin");

/**
 * Helper to safely resolve cert function across all firebase-admin versions
 */
const resolveCert = (serviceAccount) => {
    // 1. Classic SDK: admin.credential.cert
    if (admin && admin.credential && typeof admin.credential.cert === "function") {
        return admin.credential.cert(serviceAccount);
    }
    // 2. Default exported SDK: admin.default.credential.cert
    if (admin && admin.default && admin.default.credential && typeof admin.default.credential.cert === "function") {
        return admin.default.credential.cert(serviceAccount);
    }
    // 3. Modular SDK: require("firebase-admin/app").cert
    try {
        const { cert } = require("firebase-admin/app");
        if (typeof cert === "function") {
            return cert(serviceAccount);
        }
    } catch (e) {}
    // 4. Modular SDK: require("firebase-admin/credential").cert
    try {
        const { cert } = require("firebase-admin/credential");
        if (typeof cert === "function") {
            return cert(serviceAccount);
        }
    } catch (e) {}

    return null;
};

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

            // Check if valid service account credentials exist (not placeholder dots)
            const isValidCredentials = serviceAccount && 
                serviceAccount.project_id && 
                serviceAccount.project_id !== "..." && 
                serviceAccount.private_key && 
                serviceAccount.private_key !== "...";

            if (isValidCredentials) {
                const credential = resolveCert(serviceAccount);
                if (credential) {
                    const initApp = admin.initializeApp || (admin.default && admin.default.initializeApp);
                    if (typeof initApp === "function") {
                        initApp({ credential });
                        console.log("==================================");
                        console.log("✅ Firebase Admin SDK Initialized Successfully");
                        console.log("==================================");
                        return;
                    }
                }
            }

            console.log("==================================");
            console.log("ℹ️ FCM in simulation mode (Real push notifications will be simulated)");
            console.log("==================================");
        }
    } catch (error) {
        console.error("==================================");
        console.error("⚠️ Firebase initialization skipped:", error.message);
        console.log("ℹ️ Server running in simulation mode for FCM");
        console.log("==================================");
    }
};

module.exports = { admin, initFirebase };

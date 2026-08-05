require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { initFirebase } = require("./config/firebase");

// Connect to MongoDB Atlas
connectDB();

// Initialize Firebase Cloud Messaging
initFirebase();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log("==================================================");
    console.log(`🚀 Nexora Enterprise Backend Running on Port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log("==================================================");
});

// Handle unhandled promise rejections gracefully
process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection Error: ${err.message}`);
    // Keep server alive in production
});
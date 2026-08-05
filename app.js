const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");

const setLanguage = require("./middleware/languageMiddleware");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Import Route Modules
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/student");
const facultyRoutes = require("./routes/faculty");
const departmentRoutes = require("./routes/departmentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const attendanceRoutes = require("./routes/attendance");
const resultRoutes = require("./routes/results");
const feeRoutes = require("./routes/fees");
const noteRoutes = require("./routes/noteRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const noticeRoutes = require("./routes/notices");
const timetableRoutes = require("./routes/timetableRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const searchRoutes = require("./routes/searchRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();

// Security & Base Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(setLanguage);
app.use("/api/", apiLimiter);

// Serve Uploaded Media Files Statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root Base API Info Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: req.t ? req.t("WELCOME_MESSAGE") : "Welcome to Nexora AI ERP API",
        system: "Nexora Enterprise Student Management & ERP System",
        version: "2.0.0",
        apiVersion: "v1",
        documentation: "/api/docs",
        endpoints: {
            auth: "/api/auth",
            admin: "/api/admin",
            students: "/api/students",
            faculty: "/api/faculty",
            departments: "/api/departments",
            subjects: "/api/subjects",
            attendance: "/api/attendance",
            results: "/api/results",
            fees: "/api/fees",
            notes: "/api/notes",
            assignments: "/api/assignments",
            notices: "/api/notices",
            timetable: "/api/timetable",
            notifications: "/api/notifications",
            ai: "/api/ai",
            search: "/api/search",
            pdf: "/api/pdf"
        }
    });
});

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/pdf", pdfRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;

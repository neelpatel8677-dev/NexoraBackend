const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine subfolder based on route
        let folder = "uploads/";
        if (req.originalUrl.includes("notes")) {
            folder += "notes/";
        } else if (req.originalUrl.includes("timetable")) {
            folder += "timetable/";
        } else if (req.originalUrl.includes("results")) {
            folder += "results/";
        } else if (req.originalUrl.includes("profile")) {
            folder += "profiles/";
        }

        const fullPath = path.join(__dirname, "../", folder);

        // Ensure directory exists
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB file limit
});

module.exports = upload;

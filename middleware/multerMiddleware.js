const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = ["uploads/avatars", "uploads/notes", "uploads/assignments"];
uploadDirs.forEach((dir) => {
    const fullPath = path.join(__dirname, "..", dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "avatar") {
            cb(null, path.join(__dirname, "../uploads/avatars"));
        } else if (file.fieldname === "note") {
            cb(null, path.join(__dirname, "../uploads/notes"));
        } else {
            cb(null, path.join(__dirname, "../uploads/assignments"));
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

// File Extension Filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf|docx|doc|ppt|pptx|zip/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype) || file.mimetype === "application/x-zip-compressed" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation";

    if (extName || mimeType) {
        return cb(null, true);
    } else {
        cb(new Error("Unsupported file type! Only Images, PDF, DOCX, PPT, and ZIP files are allowed."));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max file size
    fileFilter
});

module.exports = upload;

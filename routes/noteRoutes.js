const express = require("express");
const router = express.Router();
const {
    uploadNote,
    getNotes,
    downloadNote,
    deleteNote
} = require("../controllers/noteController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.use(protect);

router.post("/", authorize("faculty", "admin", "super_admin"), upload.single("note"), uploadNote);
router.get("/", getNotes);
router.get("/:id/download", downloadNote);
router.delete("/:id", authorize("faculty", "admin", "super_admin"), deleteNote);

module.exports = router;

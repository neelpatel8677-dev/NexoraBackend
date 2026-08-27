const Timetable = require("../models/Timetable");
const TimetableImage = require("../models/TimetableImage");
const { sendTopicNotification } = require("../services/fcmService");

/**
 * @desc    Create or Update Timetable Schedule
 * @route   POST /api/timetable
 * @access  Private (Admin)
 */
const createOrUpdateTimetable = async (req, res, next) => {
    try {
        const { department, semester, section, dayOfWeek, slots } = req.body;

        if (!department || !semester || !dayOfWeek || !slots) {
            return res.status(400).json({
                success: false,
                message: "Please provide department, semester, dayOfWeek, and slots array"
            });
        }

        let timetable = await Timetable.findOne({
            department,
            semester: Number(semester),
            section: section || "A",
            dayOfWeek
        });

        if (timetable) {
            timetable.slots = slots;
            await timetable.save();
        } else {
            timetable = await Timetable.create({
                department,
                semester: Number(semester),
                section: section || "A",
                dayOfWeek,
                slots
            });
        }

        // Broadcast FCM Alert
        await sendTopicNotification(
            "students",
            "Timetable Updated 📅",
            `${dayOfWeek} timetable for ${department} (Sem ${semester}) has been updated.`
        );

        res.status(200).json({
            success: true,
            message: "Timetable updated successfully",
            timetable
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Student Timetable (Today's or Weekly)
 * @route   GET /api/timetable/student
 * @access  Private
 */
const getStudentTimetable = async (req, res, next) => {
    try {
        const { department, semester, section, dayOfWeek } = req.query;

        let query = {};
        if (department) query.department = department;
        if (semester) query.semester = Number(semester);
        if (section) query.section = section;
        if (dayOfWeek) query.dayOfWeek = dayOfWeek;

        const timetables = await Timetable.find(query).sort({ dayOfWeek: 1 });

        res.status(200).json({
            success: true,
            count: timetables.length,
            timetables
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Faculty Teaching Schedule
 * @route   GET /api/timetable/faculty
 * @access  Private (Faculty, Admin)
 */
const getFacultySchedule = async (req, res, next) => {
    try {
        const facultyId = req.user._id.toString();
        const facultyName = req.user.name;

        // Search timetables containing this faculty in any slot
        const timetables = await Timetable.find({
            $or: [
                { "slots.facultyId": facultyId },
                { "slots.facultyName": { $regex: facultyName, $options: "i" } }
            ]
        });

        res.status(200).json({
            success: true,
            count: timetables.length,
            timetables
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload Timetable Image
 * @route   POST /api/timetable/upload
 * @access  Private (Admin, Faculty)
 */
const uploadTimetableImage = async (req, res, next) => {
    try {
        const { department, semester, uploadedBy } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload an image file" });
        }

        const imageUrl = `/uploads/timetable/${req.file.filename}`;

        // Deactivate previous timetable for this dept/sem
        await TimetableImage.updateMany(
            { department, semester: Number(semester) },
            { isActive: false }
        );

        const timetableImage = await TimetableImage.create({
            department,
            semester: Number(semester),
            imageUrl,
            uploadedBy: uploadedBy || req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Timetable image uploaded successfully",
            imageUrl: timetableImage.imageUrl
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Timetable Image
 * @route   GET /api/timetable/image
 * @access  Private
 */
const getTimetableImage = async (req, res, next) => {
    try {
        const { department, semester } = req.query;

        const timetable = await TimetableImage.findOne({
            department,
            semester: Number(semester),
            isActive: true
        }).sort({ createdAt: -1 });

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: "No timetable image found for selected department and semester"
            });
        }

        res.status(200).json({
            success: true,
            imageUrl: timetable.imageUrl
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrUpdateTimetable,
    getStudentTimetable,
    getFacultySchedule,
    uploadTimetableImage,
    getTimetableImage
};

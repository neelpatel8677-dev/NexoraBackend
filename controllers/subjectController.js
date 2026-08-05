const Subject = require("../models/Subject");

const createSubject = async (req, res, next) => {
    try {
        const { subjectCode, subjectName, semester, credits, department, assignedFaculty } = req.body;

        const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Subject with this code already exists"
            });
        }

        const subject = await Subject.create({
            subjectCode: subjectCode.toUpperCase(),
            subjectName,
            semester,
            credits: credits || 4,
            department,
            assignedFaculty: assignedFaculty || []
        });

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject
        });
    } catch (error) {
        next(error);
    }
};

const getAllSubjects = async (req, res, next) => {
    try {
        const { department, semester } = req.query;

        let query = {};
        if (department) query.department = department;
        if (semester) query.semester = Number(semester);

        const subjects = await Subject.find(query)
            .populate("assignedFaculty", "name employeeId email department")
            .sort({ subjectCode: 1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects
        });
    } catch (error) {
        next(error);
    }
};

const getSubjectById = async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate("assignedFaculty", "name employeeId email department");

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.status(200).json({ success: true, subject });
    } catch (error) {
        next(error);
    }
};

const updateSubject = async (req, res, next) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            subject
        });
    } catch (error) {
        next(error);
    }
};

const deleteSubject = async (req, res, next) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.status(200).json({ success: true, message: "Subject deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};

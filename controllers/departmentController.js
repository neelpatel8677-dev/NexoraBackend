const Department = require("../models/Department");

const createDepartment = async (req, res, next) => {
    try {
        const { departmentCode, departmentName, hod, description } = req.body;

        const existing = await Department.findOne({ departmentCode: departmentCode.toUpperCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Department with this code already exists"
            });
        }

        const department = await Department.create({
            departmentCode: departmentCode.toUpperCase(),
            departmentName,
            hod: hod || "To Be Appointed",
            description: description || ""
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });
    } catch (error) {
        next(error);
    }
};

const getAllDepartments = async (req, res, next) => {
    try {
        const departments = await Department.find().sort({ departmentCode: 1 });
        res.status(200).json({
            success: true,
            count: departments.length,
            departments
        });
    } catch (error) {
        next(error);
    }
};

const getDepartmentById = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        res.status(200).json({ success: true, department });
    } catch (error) {
        next(error);
    }
};

const updateDepartment = async (req, res, next) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department
        });
    } catch (error) {
        next(error);
    }
};

const deleteDepartment = async (req, res, next) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        res.status(200).json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};

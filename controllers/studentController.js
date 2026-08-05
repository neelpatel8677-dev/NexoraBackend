const Student = require("../models/Student");

/**
 * @desc    Get list of all students (with advanced filtering & search)
 * @route   GET /api/students
 * @access  Private (Faculty, Admin)
 */
const getAllStudents = async (req, res, next) => {
    try {
        const { department, branch, semester, section, division, search, page = 1, limit = 50 } = req.query;

        let query = {};

        if (department) query.department = { $regex: department, $options: "i" };
        if (branch) query.branch = { $regex: branch, $options: "i" };
        if (semester) query.semester = Number(semester);
        if (section) query.section = section;
        if (division) query.division = division;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { enrollmentNo: { $regex: search, $options: "i" } },
                { rollNo: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Student.countDocuments(query);
        const students = await Student.find(query)
            .select("-password -resetPasswordToken -resetPasswordExpire")
            .sort({ enrollmentNo: 1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            count: students.length,
            students
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single student by ID (full profile)
 * @route   GET /api/students/:id
 * @access  Private
 */
const getStudentById = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id)
            .select("-password -resetPasswordToken -resetPasswordExpire");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Students can only view their own profile; faculty/admin can view any
        if (
            req.userRole === "student" &&
            req.user._id.toString() !== student._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own profile."
            });
        }

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update student profile (admin/faculty can update all fields; student updates own fields only)
 * @route   PUT /api/students/:id
 * @access  Private
 */
const updateStudentProfile = async (req, res, next) => {
    try {
        let student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Students can only update their own profile
        if (
            req.userRole === "student" &&
            req.user._id.toString() !== student._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to edit another student's profile"
            });
        }

        // Fields a student can update on their own profile
        const studentAllowedFields = [
            "name",
            "phone",
            "address",
            "guardian",
            "profileImage",
            "fcmToken"
        ];

        // Fields only admin/faculty can change
        const adminAllowedFields = [
            ...studentAllowedFields,
            "enrollmentNo",
            "rollNo",
            "department",
            "branch",
            "semester",
            "division",
            "section"
        ];

        const allowedUpdates =
            req.userRole === "student" ? studentAllowedFields : adminAllowedFields;

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                student[field] = req.body[field];
            }
        });

        const updatedStudent = await student.save();

        const studentObj = updatedStudent.toObject();
        delete studentObj.password;
        delete studentObj.resetPasswordToken;
        delete studentObj.resetPasswordExpire;

        res.status(200).json({
            success: true,
            message: "Student profile updated successfully",
            student: studentObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Patch single field on student profile
 * @route   PATCH /api/students/:id
 * @access  Private (Admin, Faculty)
 */
const patchStudent = async (req, res, next) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select("-password -resetPasswordToken -resetPasswordExpire");

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({
            success: true,
            message: "Student record patched successfully",
            student
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a student record
 * @route   DELETE /api/students/:id
 * @access  Private (Admin only)
 */
const deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await student.deleteOne();

        res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    updateStudentProfile,
    patchStudent,
    deleteStudent
};

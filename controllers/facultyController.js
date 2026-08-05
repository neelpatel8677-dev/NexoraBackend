const Faculty = require("../models/Faculty");

/**
 * @desc    Get list of all faculty members (with filtering & search)
 * @route   GET /api/faculty
 * @access  Private
 */
const getAllFaculty = async (req, res, next) => {
    try {
        const { department, designation, search, page = 1, limit = 50 } = req.query;

        let query = {};
        if (department) query.department = { $regex: department, $options: "i" };
        if (designation) query.designation = { $regex: designation, $options: "i" };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { department: { $regex: search, $options: "i" } },
                { designation: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Faculty.countDocuments(query);
        const facultyList = await Faculty.find(query)
            .select("-password -resetPasswordToken -resetPasswordExpire")
            .sort({ name: 1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            count: facultyList.length,
            faculty: facultyList
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single faculty profile by ID
 * @route   GET /api/faculty/:id
 * @access  Private
 */
const getFacultyById = async (req, res, next) => {
    try {
        const faculty = await Faculty.findById(req.params.id)
            .select("-password -resetPasswordToken -resetPasswordExpire");

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found"
            });
        }

        res.status(200).json({
            success: true,
            faculty
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update faculty profile (faculty updates own profile; admin can update any)
 * @route   PUT /api/faculty/:id
 * @access  Private
 */
const updateFacultyProfile = async (req, res, next) => {
    try {
        let faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found"
            });
        }

        // Faculty members can only update their own profile
        if (
            req.userRole === "faculty" &&
            req.user._id.toString() !== faculty._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update another faculty member's profile"
            });
        }

        // Fields a faculty member can update on their own profile
        const facultyAllowedFields = [
            "name",
            "phone",
            "profileImage",
            "fcmToken"
        ];

        // Fields only admin can change
        const adminAllowedFields = [
            ...facultyAllowedFields,
            "employeeId",
            "department",
            "designation",
            "subjects"
        ];

        const allowedUpdates =
            req.userRole === "faculty" ? facultyAllowedFields : adminAllowedFields;

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                faculty[field] = req.body[field];
            }
        });

        const updatedFaculty = await faculty.save();
        const facultyObj = updatedFaculty.toObject();
        delete facultyObj.password;
        delete facultyObj.resetPasswordToken;
        delete facultyObj.resetPasswordExpire;

        res.status(200).json({
            success: true,
            message: "Faculty profile updated successfully",
            faculty: facultyObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Patch single field on faculty profile
 * @route   PATCH /api/faculty/:id
 * @access  Private (Admin)
 */
const patchFaculty = async (req, res, next) => {
    try {
        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select("-password -resetPasswordToken -resetPasswordExpire");

        if (!faculty) {
            return res.status(404).json({ success: false, message: "Faculty member not found" });
        }

        res.status(200).json({
            success: true,
            message: "Faculty record patched successfully",
            faculty
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete faculty member
 * @route   DELETE /api/faculty/:id
 * @access  Private (Admin only)
 */
const deleteFaculty = async (req, res, next) => {
    try {
        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found"
            });
        }

        await faculty.deleteOne();

        res.status(200).json({
            success: true,
            message: "Faculty member deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllFaculty,
    getFacultyById,
    updateFacultyProfile,
    patchFaculty,
    deleteFaculty
};

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");
const Subject = require("../models/Subject");
const Fee = require("../models/Fee");
const Notice = require("../models/Notice");
const Result = require("../models/Result");

/**
 * @desc    Get Overall Admin ERP System Analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Super Admin, Admin)
 */
const getDashboardAnalytics = async (req, res, next) => {
    try {
        const [
            totalStudents,
            totalFaculty,
            totalDepartments,
            totalSubjects,
            totalNotices,
            totalResults,
            feeStats
        ] = await Promise.all([
            Student.countDocuments(),
            Faculty.countDocuments(),
            Department.countDocuments(),
            Subject.countDocuments(),
            Notice.countDocuments(),
            Result.countDocuments(),
            Fee.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFeesCollected: { $sum: "$paidAmount" },
                        totalFeesAssigned: { $sum: "$totalAmount" }
                    }
                }
            ])
        ]);

        const feesSummary = feeStats[0] || { totalFeesCollected: 0, totalFeesAssigned: 0 };
        const pendingFees = Math.max(0, feesSummary.totalFeesAssigned - feesSummary.totalFeesCollected);

        res.status(200).json({
            success: true,
            analytics: {
                totalStudents,
                totalFaculty,
                totalDepartments,
                totalSubjects,
                totalNotices,
                totalResults,
                financials: {
                    totalAssigned: feesSummary.totalFeesAssigned,
                    totalCollected: feesSummary.totalFeesCollected,
                    pendingFees
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardAnalytics };

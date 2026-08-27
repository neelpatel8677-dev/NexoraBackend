const Fee = require("../models/Fee");
const Student = require("../models/Student");
const { sendPushNotification } = require("../services/fcmService");

/**
 * @desc    Assign fee structure to a student for a semester
 * @route   POST /api/fees/assign
 * @access  Private (Admin)
 */
const assignFee = async (req, res, next) => {
    try {
        const { studentId, semester, totalAmount, dueDate } = req.body;

        if (!studentId || !semester || !totalAmount || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide studentId, semester, totalAmount, and dueDate"
            });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        let fee = await Fee.findOne({ student: studentId, semester: Number(semester) });
        if (fee) {
            fee.totalAmount = Number(totalAmount);
            fee.dueDate = new Date(dueDate);
            await fee.save();
        } else {
            fee = await Fee.create({
                student: studentId,
                semester: Number(semester),
                totalAmount: Number(totalAmount),
                dueDate: new Date(dueDate)
            });
        }

        if (student.fcmToken) {
            await sendPushNotification(
                student.fcmToken,
                "Fee Structure Assigned 💰",
                `Semester ${semester} fee of ₹${totalAmount} has been assigned. Due by ${new Date(dueDate).toLocaleDateString()}.`,
                { type: "Fee" },
                student._id
            );
        }

        res.status(201).json({
            success: true,
            message: "Fee structure assigned successfully",
            fee
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Record a fee payment transaction
 * @route   POST /api/fees/record-payment
 * @access  Private (Admin)
 */
const recordPayment = async (req, res, next) => {
    try {
        const { feeId, amount, paymentMode, referenceId, remarks } = req.body;

        if (!feeId || !amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid feeId and positive payment amount"
            });
        }

        const fee = await Fee.findById(feeId).populate("student");
        if (!fee) {
            return res.status(404).json({ success: false, message: "Fee record not found" });
        }

        fee.paidAmount += Number(amount);
        fee.transactions.push({
            amount: Number(amount),
            date: new Date(),
            paymentMode: paymentMode || "UPI",
            referenceId: referenceId || "",
            remarks: remarks || ""
        });

        await fee.save();

        if (fee.student && fee.student.fcmToken) {
            await sendPushNotification(
                fee.student.fcmToken,
                "Payment Received ✅",
                `₹${amount} received for Semester ${fee.semester} fees via ${paymentMode || "UPI"}. Balance: ₹${Math.max(0, fee.totalAmount - fee.paidAmount)}`,
                { type: "Fee" },
                fee.student._id
            );
        }

        res.status(200).json({
            success: true,
            message: "Payment recorded successfully",
            fee
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get fee records & payment history for a student
 * @route   GET /api/fees/student/:studentId
 * @access  Private
 */
const getStudentFees = async (req, res, next) => {
    try {
        let studentId = req.params.studentId;
        if (!studentId || studentId === "me") {
            studentId = req.user._id.toString();
        }

        if (
            req.userRole === "student" &&
            req.user._id.toString() !== studentId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own fee records."
            });
        }

        const feeRecords = await Fee.find({ student: studentId })
            .populate("student", "name enrollmentNo branch semester department")
            .sort({ semester: 1 });

        let totalAssigned = 0;
        let totalPaid = 0;
        feeRecords.forEach(f => {
            totalAssigned += f.totalAmount;
            totalPaid += f.paidAmount;
        });

        res.status(200).json({
            success: true,
            count: feeRecords.length,
            summary: {
                totalSemesters: feeRecords.length,
                totalFeeAssigned: totalAssigned,
                totalFeePaid: totalPaid,
                totalFeePending: Math.max(0, totalAssigned - totalPaid)
            },
            fees: feeRecords
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all fee records with filters
 * @route   GET /api/fees/all
 * @access  Private (Admin)
 */
const getAllFees = async (req, res, next) => {
    try {
        const { status, semester, page = 1, limit = 50 } = req.query;

        let query = {};
        if (status) query.status = status.toUpperCase();
        if (semester) query.semester = Number(semester);

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Fee.countDocuments(query);

        const feeRecords = await Fee.find(query)
            .populate("student", "name enrollmentNo department branch semester phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const aggregate = await Fee.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAssigned: { $sum: "$totalAmount" },
                    totalCollected: { $sum: "$paidAmount" }
                }
            }
        ]);

        const financials = aggregate[0] || { totalAssigned: 0, totalCollected: 0 };
        financials.totalPending = Math.max(0, financials.totalAssigned - financials.totalCollected);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            count: feeRecords.length,
            financials,
            fees: feeRecords
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Root Fees endpoint - dynamically serves student fees or all fees
 * @route   GET /api/fees or GET /api/fee
 * @access  Private
 */
const getRootFees = async (req, res, next) => {
    try {
        if (req.userRole === "student") {
            req.params.studentId = req.user._id.toString();
            return getStudentFees(req, res, next);
        }
        return getAllFees(req, res, next);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a specific fee record by ID
 * @route   GET /api/fees/:id
 * @access  Private
 */
const getFeeById = async (req, res, next) => {
    try {
        const fee = await Fee.findById(req.params.id)
            .populate("student", "name enrollmentNo branch semester department phone email");

        if (!fee) {
            return res.status(404).json({ success: false, message: "Fee record not found" });
        }

        res.status(200).json({ success: true, fee });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a fee record
 * @route   DELETE /api/fees/:id
 * @access  Private (Admin)
 */
const deleteFee = async (req, res, next) => {
    try {
        const fee = await Fee.findByIdAndDelete(req.params.id);
        if (!fee) {
            return res.status(404).json({ success: false, message: "Fee record not found" });
        }

        res.status(200).json({ success: true, message: "Fee record deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    assignFee,
    recordPayment,
    getStudentFees,
    getAllFees,
    getRootFees,
    getFeeById,
    deleteFee
};

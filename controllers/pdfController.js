const Result = require("../models/Result");
const Student = require("../models/Student");
const Fee = require("../models/Fee");
const { generateResultPDF, generateFeeReceiptPDF } = require("../services/pdfService");

/**
 * @desc    Generate & Stream Result Grade Card PDF
 * @route   GET /api/pdf/result/:resultId
 * @access  Private
 */
const downloadResultPDF = async (req, res, next) => {
    try {
        const result = await Result.findById(req.params.resultId).populate("student");
        if (!result) {
            return res.status(404).json({ success: false, message: "Result record not found" });
        }

        generateResultPDF(result, result.student, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate & Stream Fee Payment Receipt PDF
 * @route   GET /api/pdf/fee-receipt/:feeId/transaction/:transactionId
 * @access  Private
 */
const downloadFeeReceiptPDF = async (req, res, next) => {
    try {
        const { feeId, transactionId } = req.params;

        const feeRecord = await Fee.findById(feeId).populate("student");
        if (!feeRecord) {
            return res.status(404).json({ success: false, message: "Fee record not found" });
        }

        const transaction = feeRecord.transactions.id(transactionId) || feeRecord.transactions[feeRecord.transactions.length - 1];
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction record not found" });
        }

        generateFeeReceiptPDF(feeRecord, feeRecord.student, transaction, res);
    } catch (error) {
        next(error);
    }
};

module.exports = { downloadResultPDF, downloadFeeReceiptPDF };

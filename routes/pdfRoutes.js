const express = require("express");
const router = express.Router();
const { downloadResultPDF, downloadFeeReceiptPDF } = require("../controllers/pdfController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/result/:resultId", downloadResultPDF);
router.get("/fee-receipt/:feeId/transaction/:transactionId", downloadFeeReceiptPDF);
router.get("/fee-receipt/:feeId", downloadFeeReceiptPDF);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
    assignFee,
    recordPayment,
    getStudentFees,
    getAllFees,
    getFeeById,
    deleteFee
} = require("../controllers/feeController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Admin: assign fee structure & record payment
router.post("/assign", authorize("admin", "super_admin"), assignFee);
router.post("/record-payment", authorize("admin", "super_admin"), recordPayment);

// Admin: view all fee records with financial summary
router.get("/all", authorize("admin", "super_admin"), getAllFees);

// Anyone: get fee records for a specific student
router.get("/student/:studentId", getStudentFees);

// Anyone: get a specific fee record by ID
router.get("/:id", getFeeById);

// Admin: delete a fee record
router.delete("/:id", authorize("admin", "super_admin"), deleteFee);

module.exports = router;

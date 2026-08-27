const express = require("express");
const router = express.Router();
const {
    assignFee,
    recordPayment,
    getStudentFees,
    getAllFees,
    getRootFees,
    getFeeById,
    deleteFee
} = require("../controllers/feeController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Root fee endpoint
router.get("/", getRootFees);

// Admin: assign fee structure & record payment
router.post("/assign", authorize("admin", "super_admin", "faculty"), assignFee);
router.post("/record-payment", authorize("admin", "super_admin", "faculty"), recordPayment);

// Admin: view all fee records with financial summary
router.get("/all", authorize("admin", "super_admin", "faculty"), getAllFees);

// Anyone: get fee records for a specific student
router.get("/student/:studentId", getStudentFees);

// Anyone: get a specific fee record by ID
router.get("/:id", getFeeById);

// Admin: delete a fee record
router.delete("/:id", authorize("admin", "super_admin", "faculty"), deleteFee);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { departmentValidation } = require("../validators/departmentValidator");

router.use(protect);

router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);
router.post("/", authorize("super_admin", "admin"), departmentValidation, createDepartment);
router.put("/:id", authorize("super_admin", "admin"), updateDepartment);
router.delete("/:id", authorize("super_admin", "admin"), deleteDepartment);

module.exports = router;

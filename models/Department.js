const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
    {
        departmentCode: {
            type: String,
            required: [true, "Department Code is required"],
            unique: true,
            uppercase: true,
            trim: true
        },
        departmentName: {
            type: String,
            required: [true, "Department Name is required"],
            trim: true
        },
        hod: {
            type: String,
            default: "To Be Appointed",
            trim: true
        },
        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Department", DepartmentSchema);

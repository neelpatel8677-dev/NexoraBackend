const mongoose = require("mongoose");

const FeeSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"]
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"]
        },
        totalAmount: {
            type: Number,
            required: [true, "Total fee amount is required"],
            min: 0
        },
        paidAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        dueDate: {
            type: Date,
            required: [true, "Due date is required"]
        },
        status: {
            type: String,
            enum: ["PAID", "PARTIAL", "PENDING"],
            default: "PENDING"
        },
        transactions: [
            {
                amount: {
                    type: Number,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now
                },
                paymentMode: {
                    type: String,
                    enum: ["Online", "Cash", "UPI", "Bank Transfer", "Cheque"],
                    default: "UPI"
                },
                referenceId: {
                    type: String,
                    default: ""
                },
                remarks: {
                    type: String,
                    default: ""
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Auto calculate fee status before saving
FeeSchema.pre("save", function () {
    if (this.paidAmount >= this.totalAmount) {
        this.status = "PAID";
    } else if (this.paidAmount > 0) {
        this.status = "PARTIAL";
    } else {
        this.status = "PENDING";
    }
});

module.exports = mongoose.model("Fee", FeeSchema);

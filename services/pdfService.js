const PDFDocument = require("pdfkit");

/**
 * Generate Result / Grade Card PDF
 */
const generateResultPDF = (resultData, studentData, res) => {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=Result_Sem${resultData.semester}_${studentData.enrollmentNo}.pdf`
    );

    doc.pipe(res);

    // Document Header
    doc.fontSize(22).fillColor("#1A365D").text("NEXORA UNIVERSITY ERP", { align: "center" });
    doc.fontSize(14).fillColor("#4A5568").text("Official Academic Result Card", { align: "center" });
    doc.moveDown();

    // Student Metadata
    doc.fontSize(11).fillColor("#2D3748");
    doc.text(`Student Name : ${studentData.name}`);
    doc.text(`Enrollment No: ${studentData.enrollmentNo}`);
    doc.text(`Branch / Dept : ${studentData.branch} (${studentData.department})`);
    doc.text(`Semester      : ${resultData.semester}`);
    doc.text(`Exam Type     : ${resultData.examType}`);
    doc.text(`Publish Date  : ${new Date(resultData.publishedDate).toLocaleDateString()}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(12).fillColor("#1A365D").text("Subject Performance", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#2B6CB0");
    doc.text("Subject Code | Subject Name | Marks Obtained | Max Marks | Grade");
    doc.text("----------------------------------------------------------------------------------");

    doc.fontSize(10).fillColor("#2D3748");
    resultData.subjects.forEach((sub) => {
        const code = sub.subjectCode || "N/A";
        doc.text(
            `${code.padEnd(12)} | ${sub.subjectName.padEnd(20)} | ${String(sub.marksObtained).padStart(14)} | ${String(sub.maxMarks).padStart(9)} | ${sub.grade}`
        );
    });

    doc.moveDown();
    doc.fontSize(12).fillColor("#2C5282");
    doc.text(`Semester SGPA : ${resultData.sgpa.toFixed(2)}`);
    doc.text(`Cumulative CGPA: ${resultData.cgpa.toFixed(2)}`);

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#A0AEC0").text("This is an electronically generated official document by Nexora ERP system.", { align: "center" });

    doc.end();
};

/**
 * Generate Fee Payment Receipt PDF
 */
const generateFeeReceiptPDF = (feeRecord, studentData, transaction, res) => {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=FeeReceipt_${feeRecord._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).fillColor("#2B6CB0").text("NEXORA ACADEMIC FEES RECEIPT", { align: "center" });
    doc.moveDown();

    doc.fontSize(11).fillColor("#2D3748");
    doc.text(`Receipt Reference : ${transaction.referenceId || transaction._id}`);
    doc.text(`Student Name      : ${studentData.name}`);
    doc.text(`Enrollment Number : ${studentData.enrollmentNo}`);
    doc.text(`Semester          : ${feeRecord.semester}`);
    doc.text(`Payment Date      : ${new Date(transaction.date).toLocaleDateString()}`);
    doc.text(`Payment Mode      : ${transaction.paymentMode}`);
    doc.moveDown();

    doc.fontSize(12).fillColor("#2C5282").text("Transaction Breakdown", { underline: true });
    doc.moveDown(0.5);
    doc.text(`Total Semester Fee : ₹${feeRecord.totalAmount}`);
    doc.text(`Amount Paid Today  : ₹${transaction.amount}`);
    doc.text(`Total Paid to Date : ₹${feeRecord.paidAmount}`);
    doc.text(`Remaining Balance  : ₹${Math.max(0, feeRecord.totalAmount - feeRecord.paidAmount)}`);
    doc.text(`Payment Status     : ${feeRecord.status}`);

    doc.moveDown(3);
    doc.fontSize(9).fillColor("#A0AEC0").text("Thank you for your payment. Nexora Finance & Accounts Portal.", { align: "center" });

    doc.end();
};

module.exports = { generateResultPDF, generateFeeReceiptPDF };

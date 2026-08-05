const nodemailer = require("nodemailer");

/**
 * Send Password Reset Token via Email
 */
const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.log(`[EMAIL SIMULATION] Password Reset for ${userName} (${toEmail})`);
            console.log(`[EMAIL SIMULATION] Reset Token: ${resetToken}`);
            return { success: true, simulated: true };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5000"}/api/auth/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Nexora ERP" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: "Nexora Account Password Reset Request",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Hello ${userName},</h2>
                    <p>You requested a password reset for your Nexora account.</p>
                    <p>Your password reset code is: <strong>${resetToken}</strong></p>
                    <p>Or click the link below to set a new password:</p>
                    <a href="${resetUrl}" style="display:inline-block; background:#2B6CB0; color:#fff; padding:10px 18px; text-decoration:none; border-radius:4px;">Reset Password</a>
                    <p>This token will expire in 15 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Email Sending Error:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendPasswordResetEmail };

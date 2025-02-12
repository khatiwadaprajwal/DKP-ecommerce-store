const sendOTPByEmail = require("../utils/mailer");
const User = require("../model/usermodel");
const bcrypt = require("bcryptjs");
const Otp = require("../model/otp.model");

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();



const sendotp = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOTP();

        // Store OTP in Otp model (overwrite if an OTP already exists for this email)
        await Otp.findOneAndUpdate(
            { email }, 
            { otp, createdAt: Date.now() }, 
            { upsert: true, new: true } 
        );

        console.log(`📩 OTP Sent to: ${email}, OTP: ${otp}`); // Debugging

        // Send OTP email
        await sendOTPByEmail(email, otp);
        res.status(201).json({ message: "OTP sent to email for verification" });

    } catch (error) {
        console.error("❌ Error in sendotp:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Reset Password After Verifying OTP
const resetpassword = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        // Find OTP entry
        const otpEntry = await Otp.findOne({ email, otp });

        if (!otpEntry) return res.status(400).json({ message: "Invalid or expired OTP" });

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await User.updateOne({ email }, { password: hashedPassword });

        // Delete OTP after successful password reset
        await Otp.deleteOne({ email });

        console.log("✅ Password Reset Successful for:", email);
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("❌ Error in resetpassword:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { sendotp, resetpassword };



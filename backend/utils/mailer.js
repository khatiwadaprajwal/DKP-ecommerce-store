const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPByEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("📩 OTP Sent to:", email);
    } catch (error) {
        console.error("❌ Error Sending OTP:", error.message);
    }
};

module.exports = sendOTPByEmail;

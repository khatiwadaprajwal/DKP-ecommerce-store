const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/usermodel");
const TempUser = require("../model/tempusermodel");
const sendOTPByEmail = require("../utils/mailer");

dotenv.config();

// Signup - Save user in TempUser & Send OTP
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already registered" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save user in TempUser
        await TempUser.create({
            name,
            email,
            password: hashedPassword,
            role: "Customer",
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000),
        });

        // Send OTP email
        await sendOTPByEmail(email, otp);

        res.status(201).json({ message: "OTP sent to email for verification" });
    } catch (error) {
        console.error("❌ Error in signup:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Verify OTP and Register User
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const tempUser = await TempUser.findOne({ email });
        if (!tempUser) return res.status(404).json({ message: "User not found" });
        if (tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        // Move user to main User model
        const newUser = await User.create({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            role: tempUser.role,
        });
        // Delete temp user
        await TempUser.deleteOne({ email });
        // Generate JWT Token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "User verified and registered successfully", token });
    } catch (error) {
        console.error("❌ Error in verifyOTP:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        console.error("❌ Error in login:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { signup, verifyOTP, login };

require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


const User = require("../model/usermodel");
const TempUser = require("../model/tempusermodel");

const { sendOTPByEmail } = require("../utils/mailer");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokengenerate");

// Signup - Save user in TempUser & Send OTP
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain at least one uppercase letter and one special character",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Check for blacklisted temp user
    const existingTemp = await TempUser.findOne({ email });
    if (existingTemp) {
      if (existingTemp.isBlacklisted && existingTemp.blacklistedUntil > new Date()) {
        return res.status(403).json({ message: "Too many failed attempts. Try again later." });
      }
      // Optional: overwrite old TempUser
      await TempUser.deleteOne({ email });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await TempUser.create({
      name,
      email,
      password: hashedPassword,
      role: "Customer",
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 0,
      isBlacklisted: false,
      blacklistedUntil: null,
    });

    await sendOTPByEmail(email, otp);
    res.status(201).json({ message: "OTP sent to email for verification" });
  } catch (error) {
    console.error("❌ Error in signup:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify OTP and Register User (with Tokens and Cookies)
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check blacklist status
    if (tempUser.isBlacklisted && tempUser.blacklistedUntil > new Date()) {
      return res.status(403).json({ message: "Email is temporarily blacklisted. Try again later." });
    }

    // Check OTP and expiration
    if (tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
      tempUser.otpAttempts += 1;

      if (tempUser.otpAttempts >= 10) {
        tempUser.isBlacklisted = true;
        tempUser.blacklistedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      }

      await tempUser.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      role: tempUser.role,
    });

    await TempUser.deleteOne({ email });

    // Generate Access and Refresh Tokens
    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id, newUser.role);

    // Set cookies for tokens
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({ message: "User verified and registered successfully" });
  } catch (error) {
    console.error("❌ Error in verifyOTP:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // 2. Lock Logic
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ message: `Account locked. Try again in ${minutesLeft} minute(s)` });
    }

    // 3. Password Check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      // Lock after 10 failed attempts
      if (user.loginAttempts >= 10) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
        return res.status(403).json({ message: "Account locked due to too many failed login attempts." });
      }
      await user.save();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Success - Reset Locks
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // 5. Generate Tokens
    // MongoDB uses _id, we pass it as string
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // 6. Set Refresh Token in HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in https
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 7. Send Access Token in JSON (Frontend uses this in Headers)
    res.status(200).json({
      message: "Login successful",
      token: accessToken, // Matches your Prisma logic
      user: {
        id: user._id,
        name: user.name, // Assuming you have a name field
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const logout = (req, res) => {
  try {
    // Clear the Refresh Token Cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax"
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};

  
module.exports = {signup, verifyOTP, login,logout};
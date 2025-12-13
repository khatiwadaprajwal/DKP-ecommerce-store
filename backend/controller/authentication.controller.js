require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/usermodel");
const TempUser = require("../model/tempusermodel");
const { sendOTPByEmail } = require("../utils/mailer");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokengenerate");

// --- 1. SIGNUP ---
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });
    if (!passwordRegex.test(password)) return res.status(400).json({ message: "Password must be 6+ chars with 1 uppercase & 1 special char" });

    // 1. Check if user ALREADY exists in Main DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered. Please login." });
    }

    // 2. Check for existing Temp User & Blacklist Status
    const existingTemp = await TempUser.findOne({ email });
    if (existingTemp) {
      // ✅ RESTORED: Check if currently blacklisted
      if (existingTemp.isBlacklisted && existingTemp.blacklistedUntil > new Date()) {
        return res.status(403).json({ message: "Too many failed OTP attempts. Try again later." });
      }
      // If not blacklisted, delete old temp user to prevent duplicates
      await TempUser.deleteOne({ email });
    }

    // 3. Hash Password & OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10); // 🔒 Hash OTP for security

    // 4. Create Temp User
    await TempUser.create({
      name,
      email,
      password: hashedPassword,
      role: role || "Customer",
      otp: hashedOtp, // Store Hash
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      otpAttempts: 0,
      isBlacklisted: false,
      blacklistedUntil: null,
    });

    // 5. Send RAW OTP
    await sendOTPByEmail(email, otp);
    res.status(201).json({ message: "OTP sent to email for verification" });

  } catch (error) {
    console.error("❌ Error in signup:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- 2. VERIFY OTP ---
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body; // Raw OTP from user
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) return res.status(400).json({ message: "Invalid request or expired. Sign up again." });

    // ✅ RESTORED: Check Blacklist
    if (tempUser.isBlacklisted && tempUser.blacklistedUntil > new Date()) {
      return res.status(403).json({ message: "Email is temporarily blacklisted. Try again later." });
    }

    // 🔒 Verify OTP (Compare Hash)
    const isMatch = await bcrypt.compare(otp, tempUser.otp);
    
    // Check Expiry
    const isExpired = tempUser.otpExpires < Date.now();

    // Handle Failure (Wrong OTP or Expired)
    if (!isMatch || isExpired) {
      // ✅ RESTORED: Increment Attempts logic
      tempUser.otpAttempts += 1;

      if (tempUser.otpAttempts >= 10) {
        tempUser.isBlacklisted = true;
        tempUser.blacklistedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours lock
        await tempUser.save();
        return res.status(403).json({ message: "Too many failed attempts. Account blocked for 24 hours." });
      }

      await tempUser.save();
      return res.status(400).json({ message: isExpired ? "OTP Expired" : "Invalid OTP" });
    }

    // 🟢 DUPLICATE FIX: Last check before creation
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
       await TempUser.deleteOne({ email });
       return res.status(400).json({ message: "User already registered. Please login." });
    }

    // Success: Create User
    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password, // Already hashed
      role: tempUser.role,
    });

    await TempUser.deleteOne({ email });

    // Generate Tokens
    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id, newUser.role);

    // Set Refresh Token Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return Access Token JSON
    return res.status(200).json({ 
        message: "User verified successfully",
        accessToken, 
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error("❌ Error in verifyOTP:", error.message);
    if (error.code === 11000) return res.status(400).json({ message: "User already registered." });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- 3. LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // ✅ RESTORED: Account Lock Logic
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ message: `Account locked. Try again in ${minutesLeft} minute(s)` });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // ✅ RESTORED: Increment failed attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock after 10 failed attempts
      if (user.loginAttempts >= 10) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lock
        await user.save();
        return res.status(403).json({ message: "Account locked due to too many failed login attempts." });
      }
      
      await user.save();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success - Reset Locks
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      accessToken, // Frontend needs this
      user: {
        id: user._id,
        name: user.name, 
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- 4. REFRESH TOKEN (Needed for Frontend Interceptors) ---
const refreshAccessToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.refreshToken) return res.status(401).json({ message: "No Refresh Token" });

        const refreshToken = cookies.refreshToken;

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

            const user = await User.findById(decoded.id);
            if (!user) return res.status(401).json({ message: "User not found" });

            const newAccessToken = generateAccessToken(user._id, user.role);
            res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        console.error("Refresh Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 5. LOGOUT ---
const logout = (req, res) => {
  try {
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

module.exports = { signup, verifyOTP, login, logout, refreshAccessToken };
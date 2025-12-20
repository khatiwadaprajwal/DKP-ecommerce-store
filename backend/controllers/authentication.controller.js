// require('dotenv').config();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const User = require("../model/usermodel"); 
// const TempUser = require("../model/tempusermodel"); 

// const { sendOTPByEmail } = require("../utils/mailer"); 
// const { generateAccessToken, generateRefreshToken } = require("../utils/tokengenerate");

// // --- 1. SIGNUP ---
// const signup = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
    
//     // Regex Validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

//     if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });
//     if (!passwordRegex.test(password)) return res.status(400).json({ message: "Password must be 6+ chars with 1 uppercase & 1 special char" });

//     // 1. Check if user ALREADY exists in Main DB
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already registered. Please login." });
//     }

//     // 2. Check for existing Temp User & Blacklist Status
//     const existingTemp = await TempUser.findOne({ email });
//     if (existingTemp) {
//       if (existingTemp.isBlacklisted && existingTemp.blacklistedUntil > new Date()) {
//         return res.status(403).json({ message: "Too many failed OTP attempts. Try again later." });
//       }
//       await TempUser.deleteOne({ email });
//     }

//     // 3. Hash Password & OTP
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10); 

//     // 4. Create Temp User
//     await TempUser.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || "Customer",
//       otp: hashedOtp, 
//       otpExpires: new Date(Date.now() + 10 * 60 * 1000), 
//       otpAttempts: 0,
//       isBlacklisted: false,
//       blacklistedUntil: null,
//     });

   
//     await sendOTPByEmail(email, otp);
//     res.status(201).json({ message: "OTP sent to email for verification" });

//   } catch (error) {
//     console.error("❌ Error in signup:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // --- 2. VERIFY OTP ---
// const verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body; 
//     const tempUser = await TempUser.findOne({ email });

//     if (!tempUser) return res.status(400).json({ message: "Invalid request or expired. Sign up again." });

//     if (tempUser.isBlacklisted && tempUser.blacklistedUntil > new Date()) {
//       return res.status(403).json({ message: "Email is temporarily blacklisted. Try again later." });
//     }

//     const isMatch = await bcrypt.compare(otp, tempUser.otp);
//     const isExpired = tempUser.otpExpires < Date.now();

//     if (!isMatch || isExpired) {
//       tempUser.otpAttempts += 1;

//       if (tempUser.otpAttempts >= 10) {
//         tempUser.isBlacklisted = true;
//         tempUser.blacklistedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); 
//         await tempUser.save();
//         return res.status(403).json({ message: "Too many failed attempts. Account blocked for 24 hours." });
//       }

//       await tempUser.save();
//       return res.status(400).json({ message: isExpired ? "OTP Expired" : "Invalid OTP" });
//     }

//     const userAlreadyExists = await User.findOne({ email });
//     if (userAlreadyExists) {
//        await TempUser.deleteOne({ email });
//        return res.status(400).json({ message: "User already registered. Please login." });
//     }

//     const newUser = await User.create({
//       name: tempUser.name,
//       email: tempUser.email,
//       password: tempUser.password, 
//       role: tempUser.role,
//     });

//     await TempUser.deleteOne({ email });

//     const accessToken = generateAccessToken(newUser._id, newUser.role);
//     const refreshToken = generateRefreshToken(newUser._id, newUser.role);

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none", 
//       maxAge: 7 * 24 * 60 * 60 * 1000, 
//     });

//     return res.status(200).json({ 
//         message: "User verified successfully",
//         accessToken, 
//         user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
//     });

//   } catch (error) {
//     console.error("❌ Error in verifyOTP:", error.message);
//     if (error.code === 11000) return res.status(400).json({ message: "User already registered." });
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // --- 3. LOGIN ---
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid email or password" });

//     if (user.lockUntil && user.lockUntil > new Date()) {
//       const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
//       return res.status(403).json({ message: `Account locked. Try again in ${minutesLeft} minute(s)` });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
    
//     if (!isMatch) {
//       user.loginAttempts = (user.loginAttempts || 0) + 1;
      
//       if (user.loginAttempts >= 10) {
//         user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); 
//         await user.save();
//         return res.status(403).json({ message: "Account locked due to too many failed login attempts." });
//       }
      
//       await user.save();
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     user.loginAttempts = 0;
//     user.lockUntil = null;
//     await user.save();

//     const accessToken = generateAccessToken(user._id, user.role);
//     const refreshToken = generateRefreshToken(user._id, user.role);

  
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true, 
//       sameSite: "none", 
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.status(200).json({
//       message: "Login successful",
//       accessToken, 
//       user: {
//         id: user._id,
//         name: user.name, 
//         email: user.email,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error in login:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // --- 4. REFRESH TOKEN ---
// const refreshAccessToken = async (req, res) => {
//     try {
//         const cookies = req.cookies;
//         if (!cookies?.refreshToken) return res.status(401).json({ message: "No Refresh Token" });

//         const refreshToken = cookies.refreshToken;

//         jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
//             if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

//             const user = await User.findById(decoded.id);
//             if (!user) return res.status(401).json({ message: "User not found" });

//             const newAccessToken = generateAccessToken(user._id, user.role);
//             res.json({ accessToken: newAccessToken });
//         });
//     } catch (error) {
//         console.error("Refresh Error:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// // --- 5. LOGOUT ---
// const logout = (req, res) => {
//   try {
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true, 
//       sameSite: "none"
//     });
//     res.status(200).json({ message: "Logged out successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Logout failed" });
//   }
// };

// module.exports = { signup, verifyOTP, login, logout, refreshAccessToken };
require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/usermodel"); 
const { generateAccessToken, generateRefreshToken } = require("../utils/tokengenerate");

// ==========================================
// SECURITY LOGIC: ELIMINATING OTP
// ==========================================
// Logic: Since we removed Email Verification, we moved from 
// (Signup -> Temp -> Verify -> Main) TO (Signup -> Validate -> Main -> Token Issue).
// To secure this, we rely on HTTPOnly Cookies and Strict Validation.

// --- 1. SIGNUP (Direct Creation + Auto Login) ---
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Strict Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Enforce strong passwords: Min 8 chars, Upper, Lower, Number, Special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password too weak. Use 8+ chars, uppercase, number, & symbol." });
    }

    // 2. Check Duplicate User
    // We use .collation() if supported for case-insensitive check, otherwise regex or lowercase
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." }); // 409 Conflict is more semantically correct
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds to 12 for higher security

    // 4. Create User Directly (No TempUser)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(), // Always sanitize email to lowercase
      password: hashedPassword,
      role: role || "Customer",
      loginAttempts: 0,
      lockUntil: null
    });

   
    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id, newUser.role);

    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({ 
        message: "Account created successfully",
        accessToken, 
        user: { 
            id: newUser._id, 
            name: newUser.name, 
            email: newUser.email, 
            role: newUser.role 
        }
    });

  } catch (error) {
    console.error("❌ Error in signup:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sanitize email input
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" }); // Generic message for security

    // 1. Check Lockout Status
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ message: `Account locked. Try again in ${minutesLeft} minutes.` });
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // INCREMENT FAILED ATTEMPTS
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // LOCK ACCOUNT IF > 5 ATTEMPTS (Stricter than 10)
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
        await user.save();
        return res.status(403).json({ message: "Too many failed attempts. Account locked for 15 minutes." });
      }
      
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. SUCCESS: Reset counters
    if (user.loginAttempts > 0) {
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      accessToken, 
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


const refreshAccessToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.refreshToken) return res.status(401).json({ message: "Unauthorized" });

        const refreshToken = cookies.refreshToken;

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Session expired, please login again" });

            const user = await User.findById(decoded.id);
            if (!user) return res.status(401).json({ message: "User not found" });

            const newAccessToken = generateAccessToken(user._id, user.role);
            
            // Optional: Issue a new Refresh Token here (Token Rotation) for maximum security
            
            res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        console.error("Refresh Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- 4. LOGOUT ---
const logout = (req, res) => {
  try {
    // Clear cookie with same options as set
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict"
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};

module.exports = { signup, login, logout, refreshAccessToken };
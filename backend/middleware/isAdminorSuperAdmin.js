const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/usermodel");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const isAdminOrSuperAdmin = async (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const REFRESH_SECRET = process.env.REFRESH_SECRET;

    // 1. Get Tokens
    const authHeader = req.headers.authorization;
    let accessToken = authHeader && authHeader.split(" ")[1];
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // --- PHASE A: Verify Access Token (Header) ---
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        
        // Find User (standardized on 'id')
        const user = await User.findById(decoded.id).select("-password").lean();
        if (!user) return res.status(401).json({ message: "User not found" });

        // ✅ ROLE CHECK
        if (user.role !== "Admin" && user.role !== "SuperAdmin") {
          return res.status(403).json({ message: "Access denied: Admins only" });
        }

        req.user = user;
        return next(); 

      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({ message: "Invalid token" });
        }
        // If expired, fall through to Phase B
      }
    }

    // --- PHASE B: Access Token Expired? Check Refresh Token (Cookie) ---
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });

        // ✅ ROLE CHECK (Must repeat here)
        if (user.role !== "Admin" && user.role !== "SuperAdmin") {
          return res.status(403).json({ message: "Access denied: Admins only" });
        }

        // Generate NEW Access Token
        const newAccessToken = generateAccessToken(user._id, user.role);

        // Send new token in header
        res.setHeader("x-new-access-token", newAccessToken);
        
        req.user = user.toObject(); // or user if using lean()
        return next();

      } catch (err) {
        return res.status(401).json({ message: "Session expired. Please login again." });
      }
    }

    return res.status(401).json({ message: "Unauthorized" });

  } catch (error) {
    console.error("❌ Admin/SuperAdmin Auth Error:", error);
    return res.status(500).json({ message: "Internal Auth Error" });
  }
};

module.exports = isAdminOrSuperAdmin;
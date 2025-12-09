const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/usermodel");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const isSuperAdmin = async (req, res, next) => {
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

    // --- PHASE A: Verify Access Token ---
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        
        const user = await User.findById(decoded.id).select("-password").lean();
        if (!user) return res.status(401).json({ message: "User not found" });

        // ✅ STRICT SUPERADMIN CHECK
        if (user.role !== "SuperAdmin") {
          return res.status(403).json({ message: "Access denied: SuperAdmin only" });
        }

        req.user = user;
        return next(); 

      } catch (err) {
        if (err.name !== "TokenExpiredError") return res.status(401).json({ message: "Invalid token" });
      }
    }

    // --- PHASE B: Check Refresh Token ---
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });

        // ✅ STRICT SUPERADMIN CHECK
        if (user.role !== "SuperAdmin") {
          return res.status(403).json({ message: "Access denied: SuperAdmin only" });
        }

        const newAccessToken = generateAccessToken(user._id, user.role);
        res.setHeader("x-new-access-token", newAccessToken);
        
        req.user = user.toObject();
        return next();

      } catch (err) {
        return res.status(401).json({ message: "Session expired" });
      }
    }

    return res.status(401).json({ message: "Unauthorized" });

  } catch (error) {
    console.error("❌ SuperAdmin Auth Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = isSuperAdmin;

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/usermodel");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const isAdmin = async (req, res, next) => {
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

    // --- CASE A: Verify Access Token ---
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        
        // Fix: Use 'id', not 'userId' to match your login token generation
        const user = await User.findById(decoded.id).select("-password").lean();

        if (!user) return res.status(401).json({ message: "User not found" });

        // ✅ ADMIN CHECK
        if (user.role !== "Admin" && user.role !== "SuperAdmin") {
          return res.status(403).json({ message: "Access denied: Admins only" });
        }

        req.user = user;
        return next(); 

      } catch (err) {
        // If token is just expired, fall through to refresh logic. 
        // If it's invalid (tampered), stop here.
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({ message: "Invalid token" });
        }
      }
    }


    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });

        // ✅ ADMIN CHECK (Must check here too!)
        if (user.role !== "Admin" && user.role !== "SuperAdmin") {
          return res.status(403).json({ message: "Access denied: Admins only" });
        }

        // Generate NEW Access Token
        const newAccessToken = generateAccessToken(user._id, user.role);

        // Send new token in header so Frontend updates itself
        res.setHeader("x-new-access-token", newAccessToken);
        
        req.user = user.toObject();
        return next();

      } catch (err) {
        return res.status(401).json({ message: "Session expired. Please login again." });
      }
    }

    return res.status(401).json({ message: "Unauthorized" });

  } catch (error) {
    console.error("❌ Admin Auth Error:", error);
    return res.status(500).json({ message: "Internal Auth Error" });
  }
};

module.exports = isAdmin;

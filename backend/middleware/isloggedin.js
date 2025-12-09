const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/usermodel");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const isLoggedIn = async (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const REFRESH_SECRET = process.env.REFRESH_SECRET;

    // 1. Get Tokens
    const authHeader = req.headers.authorization;
    let accessToken = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // 2. Try to Verify Access Token (From Header)
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        
        // Find user (using lean() for performance since we just need data)
        const user = await User.findById(decoded.id).select("-password").lean();
        
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user;
        return next(); // Token is valid, proceed
      } catch (err) {
        // If error is NOT expiration (e.g., tampered token), fail immediately
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({ message: "Invalid token" });
        }
        // If "TokenExpiredError", we intentionally fall through to step 3
      }
    }

    // 3. Access Token Expired or Missing? Check Refresh Token (From Cookie)
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        
        const user = await User.findById(decoded.id).select("-password"); // Note: We need a Mongoose doc to save if needed, but lean is fine here too usually
        if (!user) return res.status(401).json({ message: "User not found" });

        // Generate NEW Access Token
        const newAccessToken = generateAccessToken(user._id, user.role);

        // ⚠️ CRITICAL: Send new token in header so Frontend can update
        res.setHeader("x-new-access-token", newAccessToken);

        // Attach user and proceed
        req.user = user.toObject(); // Convert to plain object if not using lean above
        return next();

      } catch (err) {
        console.error("Refresh Error:", err.message);
        return res.status(401).json({ message: "Session expired. Please login again." });
      }
    }

    return res.status(401).json({ message: "Unauthorized" });

  } catch (error) {
    console.error("❌ Middleware Error:", error);
    return res.status(500).json({ message: "Internal Auth Error" });
  }
};

module.exports = isLoggedIn;
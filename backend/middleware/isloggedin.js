// middleware/isLoggedIn.js
const jwt = require("jsonwebtoken");
const User = require("../model/usermodel");
require("dotenv").config();

const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Get "Bearer token"

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No access token" });
    }

    // Verify Access Token ONLY
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        // IMPORTANT: We return specific error so frontend knows to try refresh
        return res.status(403).json({ message: "Token expired or invalid" }); 
      }

      // Check if user still exists in DB
      const user = await User.findById(decoded.id).select("-password").lean();
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      req.user = user;
      next();
    });

  } catch (error) {
    console.error("Middleware Error:", error);
    return res.status(500).json({ message: "Internal Auth Error" });
  }
};

module.exports = isLoggedIn;
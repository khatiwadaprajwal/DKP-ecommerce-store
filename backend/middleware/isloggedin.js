// middleware/isloggedin.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/usermodel");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const isLoggedIn = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized access: No token provided" });
    }

    // Remove "Bearer " prefix if present
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7);
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
     

      // Check if token expired
      if (decoded.exp * 1000 < Date.now()) {
        return res.status(401).json({ msg: "Session expired, please log in again" });
      }

      // Retrieve user by decoded ID
      const user = await User.findById(decoded.userId).lean();
      if (!user) {
        return res.status(401).json({ msg: "Unauthorized access: User not found" });
      }

      // Attach user to req.user for consistency in other controllers
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Session expired, please log in again" });
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Error in authentication:", error.message);
    return res.status(401).json({ msg: "Unauthorized access: Invalid or expired token" });
  }
};

module.exports = isLoggedIn;

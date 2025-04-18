const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../model/usermodel");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const isSuperAdmin = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized: No token" });
    }

    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7);
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ msg: "Session expired" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "SuperAdmin") {
      return res.status(403).json({ msg: "Only SuperAdmin can perform this action" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ isSuperAdmin error:", error.message);
    res.status(403).json({ msg: "Unauthorized or invalid token" });
  }
};

module.exports = isSuperAdmin;

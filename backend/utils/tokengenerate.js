// CommonJS style
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();  // Load env variables



 const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role }, // Payload: consistent 'id' and 'role'
    process.env.JWT_SECRET,
    { expiresIn: "10s" } 
  );
};

 const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const generatePasswordResetToken = () => {
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiresAt = Date.now() + 10 * 60 * 1000;

  return { resetToken, hashedToken, expiresAt };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
};

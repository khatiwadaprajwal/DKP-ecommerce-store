// CommonJS style
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();  // Load env variables

const generateAccessToken = (userId, accountType) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT Secret is not defined!");

    return jwt.sign({ sub: userId, accountType }, jwtSecret, {
      expiresIn: "30m",
    });
  } catch (error) {
    throw new Error(`Error generating access token: ${error.message}`);
  }
};

const generateRefreshToken = (userId, accountType) => {
  try {
    const refreshTokenSecret = process.env.REFRESH_SECRET;
    if (!refreshTokenSecret) throw new Error("Refresh Token Secret is not defined!");

    return jwt.sign({ sub: userId, accountType }, refreshTokenSecret, {
      expiresIn: "24h",
    });
  } catch (error) {
    throw new Error(`Error generating refresh token: ${error.message}`);
  }
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

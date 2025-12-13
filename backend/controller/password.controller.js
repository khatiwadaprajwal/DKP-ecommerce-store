const { sendOTPByEmail } = require("../utils/mailer");
const User = require("../model/usermodel");
const bcrypt = require("bcryptjs");
const Otp = require("../model/otp.model");

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Send OTP (Now Hashes the OTP before storage)
const sendotp = async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. Generate Raw OTP
        const otp = generateOTP();

        // 🔒 2. Hash the OTP (Security Step)
        const hashedOtp = await bcrypt.hash(otp, 10);

        // 3. Store the HASHED OTP in DB
        await Otp.findOneAndUpdate(
            { email }, 
            { 
                otp: hashedOtp, // Store hash, not raw
                createdAt: Date.now(),
                otpAttempts: 0, // Reset attempts on new OTP
                isBlacklisted: false 
            }, 
            { upsert: true, new: true } 
        );

        console.log(`📩 OTP Sent to: ${email}`); // Don't log raw OTP in production

        // 4. Send the RAW OTP via Email
        await sendOTPByEmail(email, otp);
        
        res.status(201).json({ message: "OTP sent to email for verification" });

    } catch (error) {
        console.error("❌ Error in sendotp:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// ✅ Reset Password (Now Compares Hashed OTP)
const resetpassword = async (req, res) => {
  try {
      const { email, password, otp } = req.body; // 'otp' here is raw

      // Find OTP entry
      const otpEntry = await Otp.findOne({ email });

      if (!otpEntry) {
          return res.status(400).json({ message: "No OTP request found for this email" });
      }

      // Check if blacklisted
      if (otpEntry.isBlacklisted && otpEntry.blacklistedUntil > new Date()) {
          return res.status(403).json({ message: "Too many failed attempts. Try again later." });
      }

      // 🔒 Check if OTP matches (Using bcrypt compare)
      const isMatch = await bcrypt.compare(otp, otpEntry.otp);

      if (!isMatch) {
          otpEntry.otpAttempts += 1;

          // Blacklist after 10 failed attempts
          if (otpEntry.otpAttempts >= 10) {
              otpEntry.isBlacklisted = true;
              otpEntry.blacklistedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          }

          await otpEntry.save();
          return res.status(400).json({ message: "Invalid OTP" });
      }

      // OTP matched — reset password
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ email }, { password: hashedPassword });

      // Cleanup OTP entry
      await Otp.deleteOne({ email });

      console.log("✅ Password Reset Successful for:", email);
      res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
      console.error("❌ Error in resetpassword:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
  }
};


// ✅ Change Password (Authenticated User) - Unchanged but included for completeness
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ msg: "Please provide old and new passwords" });
    }

    // Find full user from DB for latest password + attempts info
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 🔒 Check if currently locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ msg: `Too many incorrect attempts. Try again in ${minutesLeft} minute(s).` });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      // Increment failed attempts
      user.loginAttempts += 1;

      if (user.loginAttempts >= 10) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // lock for 1 hour
        await user.save();
        return res.status(403).json({ msg: "Too many incorrect attempts. You are temporarily locked out for 1 hour." });
      }

      await user.save();
      return res.status(401).json({ msg: "Old password is incorrect" });
    }

    // ✅ Success — reset lock state
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.status(200).json({ msg: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Error in changePassword:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { sendotp, resetpassword, changePassword };

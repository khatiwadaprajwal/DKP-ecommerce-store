// controllers/makeadmin.controller.js
const User = require("../model/usermodel");

const makeAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role === "Admin") {
      return res.status(400).json({ msg: "User is already an Admin" });
    }

    // Update user role
    user.role = "Admin";
    await user.save();

    res.status(200).json({ msg: "User promoted to Admin successfully" });
  } catch (error) {
    console.error("❌ Error in makeAdmin:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = makeAdmin;

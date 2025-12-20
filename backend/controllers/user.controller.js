const User = require("../model/usermodel");
const bcrypt = require("bcryptjs");

// Get all customers (for admin use, for example)
const getAllCustomers = async (req, res) => {
    try {
        const users = await User.find();

        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getCustomerByEmail = async (req, res) => {
    try {
        let { email } = req.params; // Extract email from params

        if (!email) {
            return res.status(400).json({ message: "Email is required in URL parameters" });
        }

        email = String(email).trim(); 
        console.log("Received email:", email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user by email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const updateUser = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required in parameters" });
    }

    // Find the user in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure req.user exists before checking authorization
    if (!req.user || req.user.email !== email) {
      return res.status(403).json({ message: "You are not authorized to update this user" });
    }

    const {  ...otherUpdates } = req.body;

    
   
    // Update user in MongoDB using `findOneAndUpdate`
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: otherUpdates },
      { new: true, runValidators: true } // `new: true` returns updated user, `runValidators: true` ensures validation
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  getAllCustomers,
  getCustomerByEmail,
  updateUser
};

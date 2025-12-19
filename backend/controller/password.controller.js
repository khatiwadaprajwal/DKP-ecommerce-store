const User = require("../model/usermodel");
const bcrypt = require("bcryptjs");

// ==========================================
// 1. GET SECURITY QUESTIONS (Step 1 of Forgot Password)
// ==========================================
// User enters email -> We return the 3 questions (text only)
// Add this to passwordController.js
const setSecurityQuestions = async (req, res) => {
    try {
        const { securityQuestions } = req.body;
        if (!securityQuestions || securityQuestions.length !== 3) {
            return res.status(400).json({ message: "Provide 3 questions." });
        }
        const user = await User.findById(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const processedQuestions = await Promise.all(
            securityQuestions.map(async (q) => {
                const hashedAnswer = await bcrypt.hash(q.answer.trim().toLowerCase(), 12);
                return { question: q.question, answer: hashedAnswer };
            })
        );
        user.securityQuestions = processedQuestions;
        await user.save();
        res.status(200).json({ message: "Security questions updated." });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};



const getSecurityQuestions = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) return res.status(400).json({ message: "Email is required" });

        // Find user, return ONLY the questions (exclude answers, password, etc)
        const user = await User.findOne({ email: email.toLowerCase() })
                               .select("securityQuestions.question securityQuestions._id");

        if (!user) {
            // Security: Don't reveal if user exists. Return 404 or generic message.
            return res.status(404).json({ message: "User not found" });
        }

        if (user.securityQuestions.length === 0) {
            return res.status(400).json({ message: "Account has no security questions set up." });
        }

        // Return array of { _id, question }
        res.status(200).json({ 
            email: user.email,
            questions: user.securityQuestions 
        });

    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ==========================================
// 2. VERIFY ANSWERS & RESET PASSWORD (Step 2)
// ==========================================
const resetPassword = async (req, res) => {
    try {
        // 'answers' should be an object: { "question_id_1": "answer1", "question_id_2": "answer2" }
        const { email, answers, newPassword } = req.body;

        // 1. Validate Password Strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: "Password too weak. Must be 8+ chars with Upper, Lower, Number & Special." });
        }

        // 2. Find User (Explicitly select hidden answers)
        const user = await User.findOne({ email: email.toLowerCase() }).select("+securityQuestions.answer");

        if (!user) return res.status(404).json({ message: "User not found" });

        // 3. Check Lockout Status (Brute force protection)
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(403).json({ message: `Account locked. Try again in ${minutesLeft} minutes.` });
        }

        // 4. Verify ALL 3 Answers
        let allCorrect = true;

        if (!user.securityQuestions || user.securityQuestions.length === 0) {
            return res.status(400).json({ message: "Security questions not set up." });
        }

        for (let dbQ of user.securityQuestions) {
            // Get the user's submitted answer for this specific Question ID
            const submittedAnswer = answers[dbQ._id];
            
            if (!submittedAnswer) {
                allCorrect = false;
                break;
            }

            // Normalize (trim + lowercase) and Compare Hash
            const isMatch = await bcrypt.compare(submittedAnswer.trim().toLowerCase(), dbQ.answer);
            
            if (!isMatch) {
                allCorrect = false;
                break;
            }
        }

        // 5. Handle Incorrect Answers
        if (!allCorrect) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            
            // Lock after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
                await user.save();
                return res.status(403).json({ message: "Too many failed attempts. Account locked for 30 minutes." });
            }

            await user.save();
            return res.status(400).json({ message: "One or more answers are incorrect." });
        }

        // 6. SUCCESS: Reset Password & Clear Locks
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        console.log(`✅ Password reset successfully for: ${email}`);
        res.status(200).json({ message: "Password reset successfully. You can now login." });

    } catch (error) {
        console.error("❌ Error in resetPassword:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ==========================================
// 3. CHANGE PASSWORD (Authenticated)
// ==========================================
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide old and new passwords" });
    }

    // req.user.id comes from your verifyToken middleware
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Check Lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ message: `Account locked. Try again in ${minutesLeft} minutes.` });
    }

    // 2. Verify Old Password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();
        return res.status(403).json({ message: "Too many failed attempts. Account locked for 1 hour." });
      }

      await user.save();
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 3. Check if new password is same as old
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ message: "New password cannot be the same as old password" });

    // 4. Update
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("❌ Error in changePassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { setSecurityQuestions, getSecurityQuestions, resetPassword, changePassword };
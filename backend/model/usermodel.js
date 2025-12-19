const mongoose = require("mongoose")
const UserSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Customer","SuperAdmin"], required: true },
    securityQuestions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true, select: false } // HASHED Answer
    }
  ],
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
        default: null,
    }, timestamps: true
    
});
module.exports = mongoose.model('User', UserSchema);
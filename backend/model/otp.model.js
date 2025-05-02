const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    otpAttempts: {
        type: Number,
        default: 0,
    },
    isBlacklisted: {
        type: Boolean,
        default: false,
    },
    blacklistedUntil: {
        type: Date,
        default: null,
    }
});
//OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
module.exports = mongoose.model("Otp", OtpSchema);
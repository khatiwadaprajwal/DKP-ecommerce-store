const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now } 
});
OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
module.exports = mongoose.model("Otp", OtpSchema);
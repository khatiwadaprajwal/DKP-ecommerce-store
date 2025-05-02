const cron = require("node-cron");
const TempUser = require("../model/tempusermodel"); 

const Otp = require("../model/otp.model");

// Run cleanup job every hour
cron.schedule("*/20 * * * *", async () => {  // This runs every 20 min
    
    console.log("⏳ Running cleanup job...");

    try {
        const currentTime = new Date();

        // **Handling TempUser Cleanup**
        // Delete unblocked TempUser records with expired OTP, but only if expired for more than 1 minute
        const deletedTempUsers = await TempUser.deleteMany({
            otpExpires: { $lt: new Date(currentTime.getTime() - 1 * 60 * 1000) },  // Expired for more than 1 minute
            isBlacklisted: false,  // Only delete if not blacklisted
        });

        console.log(`🗑️ Deleted ${deletedTempUsers.deletedCount} expired unblocked TempUser records.`);

        // Reset blacklisted TempUser records if blacklist period has expired
        const resetBlacklistedTempUsers = await TempUser.updateMany(
            {
                isBlacklisted: true,
                blacklistedUntil: { $lt: currentTime },  // Blacklist expired
            },
            {
                $set: {
                    isBlacklisted: false,
                    blacklistedUntil: null,  // Reset blacklist time for blacklisted users
                },
            }
        );

        console.log(`🔓 Reset ${resetBlacklistedTempUsers.modifiedCount} blacklisted TempUser records.`);

        // **Handling OTP Cleanup**
        // Delete unblocked OTP records with expired OTP, but only if expired for more than 1 minute
        const deletedOtpRecords = await Otp.deleteMany({
            createdAt: { $lt: new Date(currentTime.getTime() - 1 * 60 * 1000) },  // Expired for more than 1 minute
            isBlacklisted: false,  // Only delete if not blacklisted
        });

        console.log(`🗑️ Deleted ${deletedOtpRecords.deletedCount} expired unblocked OTP records.`);

        // Reset blacklisted OTP records if blacklist period has expired
        const resetBlacklistedOtpRecords = await Otp.updateMany(
            {
                isBlacklisted: true,
                blacklistedUntil: { $lt: currentTime },  // Blacklist expired
            },
            {
                $set: {
                    isBlacklisted: false,
                    blacklistedUntil: null,  // Reset blacklist time for blacklisted OTP records
                },
            }
        );

        console.log(`🔓 Reset ${resetBlacklistedOtpRecords.modifiedCount} blacklisted OTP records.`);

    } catch (error) {
        console.error("❌ Error running cleanup job:", error.message);
    }
});

// const express = require('express');
// const router = express.Router();
// const { signup, verifyOTP, login,logout,refreshAccessToken } = require('../controller/authentication.controller')
// router.post('/login',login);
// router.post('/signup',signup);
// router.post('/verify-otp',verifyOTP);
// router.post('/logout',logout);

// router.get("/refresh", refreshAccessToken);
// module.exports=router;
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Import controllers (verifyOTP is removed)
const { 
    signup, 
    login, 
    logout, 
    refreshAccessToken 
} = require('../controller/authentication.controller');

// --- SECURITY: Rate Limiter ---

// It limits a single IP address to 20 requests every 15 minutes.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per `window`
    message: { message: "Too many attempts from this IP, please try again after 15 minutes" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

router.post('/logout', logout);
router.get("/refresh", refreshAccessToken);

module.exports = router;
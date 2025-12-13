const express = require('express');
const router = express.Router();
const { signup, verifyOTP, login,logout,refreshAccessToken } = require('../controller/authentication.controller')
router.post('/login',login);
router.post('/signup',signup);
router.post('/verify-otp',verifyOTP);
router.post('/logout',logout);
// ✅ CORRECT: No middleware. The controller handles the security via the Cookie.
router.get("/refresh", refreshAccessToken);
module.exports=router;
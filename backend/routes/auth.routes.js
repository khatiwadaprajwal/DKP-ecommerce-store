const express = require('express');
const router = express.Router();


const { signup, verifyOTP, login } = require('../controller/authentication.controller')

router.post('/login',login);
router.post('/signup',signup);
router.post('/verify-otp',verifyOTP);

module.exports=router;
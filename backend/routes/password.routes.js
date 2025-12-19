const express = require('express');
const router = express.Router();
const{setSecurityQuestions,getSecurityQuestions,resetPassword,changePassword}=require("../controller/password.controller")
const isLoggedIn = require("../middleware/isloggedin");



router.put("/set-security-questions", isLoggedIn, setSecurityQuestions);

router.put('/resetpassword',resetPassword);

router.post('/get-security-questions',getSecurityQuestions);

router.put("/changepassword", isLoggedIn, changePassword);

module.exports=router;
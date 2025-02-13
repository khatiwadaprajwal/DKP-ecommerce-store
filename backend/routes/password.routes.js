const express = require('express');
const router = express.Router();
const{sendotp,resetpassword,changePassword}=require("../controller/password.controller")
const isLoggedIn = require("../middleware/isloggedin");



router.post('/sendotp',sendotp);

router.put('/resetpassword',resetpassword);

router.put("/changepassword", isLoggedIn, changePassword);

module.exports=router;
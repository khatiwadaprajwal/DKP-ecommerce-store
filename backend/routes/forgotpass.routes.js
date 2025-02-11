const express = require('express');
const router = express.Router();
const{sendotp,resetpassword}=require("../controller/forgotpassword.controller")



router.post('/sendotp',sendotp);

router.put('/resetpassword',resetpassword);

module.exports=router;
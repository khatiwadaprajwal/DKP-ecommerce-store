const express = require('express');
const router = express.Router();
const isloggedin=require("../middleware/isloggedin");
const isAdmin=require("../middleware/isadmin")

const {
  sendMessage,
  getAllMessages,
  getMessagesByEmail
} = require('../controller/sendmsg.controller');

router.post('/send', sendMessage,isloggedin);
router.get('/all', getAllMessages,isloggedin,isAdmin);
router.get("/msg/:email", getMessagesByEmail,isloggedin,isAdmin);

module.exports = router;

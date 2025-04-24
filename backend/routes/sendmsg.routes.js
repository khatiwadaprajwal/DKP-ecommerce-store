const express = require('express');
const router = express.Router();
const isloggedin=require("../middleware/isloggedin");
const isAdmin=require("../middleware/isadmin")

const {
  sendMessage,
  getAllMessages,
  getMessagesByEmail
} = require('../controller/sendmsg.controller');
const isAdminOrSuperAdmin = require('../middleware/isAdminorSuperAdmin');

router.post('/send', sendMessage,isloggedin);
router.get('/all',isloggedin,isAdminOrSuperAdmin, getAllMessages);
router.get("/msg/:email", isloggedin,isAdminOrSuperAdmin, getMessagesByEmail);

module.exports = router;

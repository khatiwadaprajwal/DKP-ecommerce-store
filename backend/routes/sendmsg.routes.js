const express = require('express');
const router = express.Router();
const isloggedin = require("../middleware/isloggedin");
const isAdminOrSuperAdmin = require('../middleware/isAdminorSuperAdmin');

const {
  sendMessage,
  getAllMessages,
  getMessagesByEmail,
  replyToMessage
} = require('../controllers/sendmsg.controller');

// Route to send a new message
router.post('/send', isloggedin, sendMessage);

// Route to get all messages (Admin or SuperAdmin only)
router.get('/all', isloggedin, isAdminOrSuperAdmin, getAllMessages);

// Route to get messages by email (Admin or SuperAdmin only)
router.get("/msg/:email", isloggedin, isAdminOrSuperAdmin, getMessagesByEmail);

// Route to reply to a message (Admin or SuperAdmin only)
router.post("/reply", isloggedin, isAdminOrSuperAdmin, replyToMessage);

module.exports = router;

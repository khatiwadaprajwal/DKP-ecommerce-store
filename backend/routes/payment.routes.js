const express = require('express');
const router = express.Router();
const { verifyKhaltiPayment, getPaymentStatus } = require('../controllers/payment.controller');
const isLoggedIn = require('../middleware/isloggedin');

// Verify Khalti payment
router.post('/verify-khalti', isLoggedIn, verifyKhaltiPayment);

// Get payment status
router.get('/status/:orderId', isLoggedIn, getPaymentStatus);

module.exports = router; 
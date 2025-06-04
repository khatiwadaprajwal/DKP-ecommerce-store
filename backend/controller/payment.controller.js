const axios = require('axios');
const Order = require('../model/order.model');

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_VERIFY_URL = "https://khalti.com/api/v2/payment/verify/";

// Verify Khalti payment
exports.verifyKhaltiPayment = async (req, res) => {
    try {
        const { token, amount, orderId } = req.body;

        // Verify payment with Khalti
        const response = await axios.post(
            KHALTI_VERIFY_URL,
            {
                token: token,
                amount: amount
            },
            {
                headers: {
                    'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.idx) {
            // Payment verified successfully
            // Update order status
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: "Paid",
                paymentId: response.data.idx,
                status: "Processing",
                transactionDetails: response.data
            });

            return res.json({
                success: true,
                message: "Payment verified successfully",
                data: response.data
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }
    } catch (error) {
        console.error("Khalti verification error:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.response?.data || error.message
        });
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.json({
            success: true,
            paymentStatus: order.paymentStatus,
            transactionDetails: order.transactionDetails
        });
    } catch (error) {
        console.error("Get payment status error:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting payment status",
            error: error.message
        });
    }
}; 
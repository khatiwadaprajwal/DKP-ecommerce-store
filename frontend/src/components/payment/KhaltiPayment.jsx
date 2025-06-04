import React from 'react';
import KhaltiCheckout from 'khalti-checkout-web';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KhaltiPayment = ({ amount, orderId }) => {
    const navigate = useNavigate();

    // Khalti configuration
    let config = {
        publicKey: "YOUR_PUBLIC_KEY", // Replace with your Khalti public key
        productIdentity: orderId,
        productName: "E-commerce Order",
        productUrl: "http://localhost:3000",
        eventHandler: {
            onSuccess(payload) {
                // Handle success
                verifyPayment(payload);
            },
            onError(error) {
                // Handle errors
                console.log(error);
                alert("Payment failed. Please try again.");
            },
            onClose() {
                console.log("Payment widget closed");
            }
        },
        paymentPreference: [
            "KHALTI",
            "EBANKING",
            "MOBILE_BANKING",
            "CONNECT_IPS",
            "SCT"
        ],
    };

    // Create Khalti checkout instance
    let checkout = new KhaltiCheckout(config);

    // Function to verify payment with backend
    const verifyPayment = async (payload) => {
        try {
            const response = await axios.post('/api/payment/verify-khalti', {
                token: payload.token,
                amount: payload.amount,
                orderId: orderId
            });

            if (response.data.success) {
                // Payment verified successfully
                alert("Payment successful!");
                navigate('/order-success');
            } else {
                alert("Payment verification failed. Please contact support.");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
        }
    };

    return (
        <button
            onClick={() => checkout.show({ amount: amount * 100 })} // Khalti expects amount in paisa
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
            Pay with Khalti
        </button>
    );
};

export default KhaltiPayment; 
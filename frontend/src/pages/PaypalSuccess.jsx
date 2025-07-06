import React, { useEffect, useState } from 'react';
import { Check, ShoppingBagIcon, X } from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const PaypalSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { backend_url } = useContext(ShopContext);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get('orderId');
        const paymentId = queryParams.get('paymentId');
        const PayerID = queryParams.get('PayerID');
        const userId = queryParams.get('userId');
        const productIds = queryParams.get('productIds');

        // If no paymentId or PayerID, it means payment was cancelled
        if (!paymentId || !PayerID) {
          throw new Error('Payment was cancelled or not completed');
        }

        if (!orderId || !userId || !productIds) {
          throw new Error('Missing required payment parameters');
        }

        // Call backend API to confirm payment and update order
        const response = await axios.get(`${backend_url}/v1/paypal/success`, {
          params: {
            orderId,
            paymentId,
            PayerID,
            userId,
            productIds
          }
        });

        if (response.data.order) {
          setOrderId(response.data.order._id);
          setLoading(false);
          // Auto-close popup after 5 seconds
          setTimeout(() => {
            redirectToOrderPage(response.data.order._id);
          }, 5000);
        } else {
          throw new Error(response.data.error || 'Payment processing failed');
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to process payment');
        setLoading(false);

        // If payment was cancelled, redirect to cart after 3 seconds
        if (err.message === 'Payment was cancelled or not completed') {
          setTimeout(() => {
            window.location.href = '/cart';
          }, 3000);
        }
      }
    };

    processPayment();
  }, [location, backend_url]);

  const redirectToOrderPage = (confirmedOrderId) => {
    if (window.opener) {
      window.opener.postMessage({ 
        type: 'PAYMENT_SUCCESS', 
        orderId: confirmedOrderId 
      }, '*');
      window.close();
    } else {
      window.location.href = '/orders';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-red-500 px-6 py-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Payment Failed</h1>
            <p className="mt-2 text-white">{error}</p>
          </div>
          <div className="px-6 py-6 text-center">
            <p className="text-gray-500 mb-4">
              {error === 'Payment was cancelled or not completed' 
                ? 'Redirecting you back to your cart...'
                : 'You can try placing the order again.'}
            </p>
            <button
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => window.location.href = '/cart'}
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-green-500 px-6 py-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Payment Successful!</h1>
          <p className="mt-2 text-white">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>
        
        <div className="px-6 py-6 text-center">
          <p className="text-gray-600 mb-6">
            Order ID: <span className="font-medium">{orderId}</span>
          </p>
          <p className="text-gray-500 mb-6">
            This window will automatically close in a few seconds and redirect you to your order details.
          </p>
          
          <button
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => redirectToOrderPage(orderId)}
          >
            View Order Details Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaypalSuccess;
import React, { useEffect, useState } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api'; // ✅ 1. Use centralized API instance

const PaypalSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        
        // Extract parameters
        const orderIdParam = queryParams.get('orderId');
        const paymentId = queryParams.get('paymentId');
        const PayerID = queryParams.get('PayerID');
        const userId = queryParams.get('userId');
        
        // Try to get productIds (from URL or LocalStorage), but treat as Optional
        let productIds = queryParams.get('productIds');
        if (!productIds) {
          productIds = localStorage.getItem('paypal_pending_product_ids');
        }

        // ✅ 2. Validate ONLY strictly required PayPal params
        if (!paymentId || !PayerID) {
            throw new Error('Payment was cancelled or invalid.');
        }
        
        if (!orderIdParam) {
            throw new Error('Missing Order ID.');
        }

        // ✅ 3. Use api.get (Base URL & Headers handled automatically)
        const response = await api.get('/v1/paypal/success', {
          params: { 
            orderId: orderIdParam, 
            paymentId, 
            PayerID, 
            userId, 
            productIds: productIds || "" // Send empty string if null, don't crash
          }
        });

        if (response.data.order || response.data.success) {
          const finalOrderId = response.data.order?._id || orderIdParam;
          setConfirmedOrderId(finalOrderId);
          
          // Cleanup
          localStorage.removeItem('paypal_pending_product_ids'); 
          setLoading(false);
          
          // Redirect
          setTimeout(() => redirectToOrderPage(finalOrderId), 3000);
        } else {
          throw new Error(response.data.error || 'Payment verification failed.');
        }
      } catch (err) {
        console.error('Payment error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to verify payment.');
        setLoading(false);
        
        // If it was a cancellation, redirect faster
        if (err.message.includes('cancelled')) {
            setTimeout(() => navigate('/cart'), 3000);
        }
      }
    };

    processPayment();
    // eslint-disable-next-line
  }, [location, navigate]);

  const redirectToOrderPage = (id) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'PAYMENT_SUCCESS', orderId: id }, '*');
      window.close();
    } else {
      navigate('/order');
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader className="w-16 h-16 text-blue-600 animate-spin mb-4"/>
            <h2 className="text-xl font-semibold text-gray-700">Verifying Payment...</h2>
            <p className="text-gray-500">Please do not close this window.</p>
        </div>
      );
  }

  if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10 text-red-600"/>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                    onClick={() => navigate('/cart')} 
                    className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition"
                >
                    Return to Cart
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
         <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600"/>
         </div>
         <h1 className="text-2xl font-bold text-gray-800 mb-2">Success!</h1>
         <p className="text-gray-600 mb-6">Order confirmed. Redirecting you to your orders...</p>
         <button 
            onClick={() => redirectToOrderPage(confirmedOrderId)} 
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
         >
            View Order
         </button>
      </div>
    </div>
  );
};

export default PaypalSuccess;
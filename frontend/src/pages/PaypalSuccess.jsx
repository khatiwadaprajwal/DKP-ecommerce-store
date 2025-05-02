import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const PaypalSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Simulate API call to get just the order ID
    setTimeout(() => {
      setOrderId("ORD298371");
      setLoading(false);
    }, 1000);

    // Auto-close popup after 5 seconds
    const timer = setTimeout(() => {
      redirectToOrderPage();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const redirectToOrderPage = () => {
    // For popup windows, you can use window.opener to communicate with parent window
    if (window.opener) {
      // Send message to parent window (if needed)
      window.opener.postMessage({ type: 'PAYMENT_SUCCESS', orderId: orderId }, '*');
      // Close this popup window
      window.close();
    } else {
      // If not in popup, redirect to orders page
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-green-500 px-6 py-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Payment Successful!</h1>
          <p className="mt-2 text-white">
            Thank you for your purchase. Your payment was processed successfully.
          </p>
        </div>
        
        <div className="px-6 py-6 text-center">
          {/* <p className="text-gray-600 mb-6">
            Order ID: <span className="font-medium">{orderId}</span>
          </p> */}
          <p className="text-gray-500 mb-6">
            This window will automatically close in a few seconds and redirect you to your order details.
          </p>
          
          <button
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            onClick={redirectToOrderPage}
          >
            View Order Details Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaypalSuccess;
import React, { useEffect, useState, useContext } from 'react';
import { Check, X } from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
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
        const orderIdParam = queryParams.get('orderId');
        const paymentId = queryParams.get('paymentId');
        const PayerID = queryParams.get('PayerID');
        const userId = queryParams.get('userId');
        
        // 🟢 2. RETRIEVE FROM URL OR LOCAL STORAGE
        let productIds = queryParams.get('productIds');
        if (!productIds) {
          productIds = localStorage.getItem('paypal_pending_product_ids');
        }

        if (!paymentId || !PayerID) throw new Error('Payment cancelled');
        
        // Check required fields (Including productIds which comes from localStorage now)
        if (!orderIdParam || !userId || !productIds) {
          throw new Error('Missing required payment parameters (Product IDs missing)');
        }

        const response = await axios.get(`${backend_url}/v1/paypal/success`, {
          params: { orderId: orderIdParam, paymentId, PayerID, userId, productIds }
        });

        if (response.data.order) {
          setOrderId(response.data.order._id);
          localStorage.removeItem('paypal_pending_product_ids'); // Cleanup
          setLoading(false);
          setTimeout(() => redirectToOrderPage(response.data.order._id), 5000);
        } else {
          throw new Error(response.data.error || 'Payment failed');
        }
      } catch (err) {
        console.error('Payment error:', err);
        setError(err.response?.data?.error || err.message || 'Failed');
        setLoading(false);
        if (err.message === 'Payment cancelled') setTimeout(() => window.location.href = '/cart', 3000);
      }
    };

    processPayment();
  }, [location, backend_url]);

  const redirectToOrderPage = (confirmedOrderId) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'PAYMENT_SUCCESS', orderId: confirmedOrderId }, '*');
      window.close();
    } else {
      window.location.href = '/order';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Processing...</div>;
  if (error) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4"/>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
            <p className="mb-4">{error}</p>
            <button onClick={()=>window.location.href='/cart'} className="bg-blue-600 text-white px-4 py-2 rounded">Return to Cart</button>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow text-center">
         <Check className="w-16 h-16 text-green-500 mx-auto mb-4"/>
         <h1 className="text-2xl font-bold text-green-600 mb-2">Success!</h1>
         <p>Order confirmed. Redirecting...</p>
         <button onClick={()=>redirectToOrderPage(orderId)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">View Order</button>
      </div>
    </div>
  );
};

export default PaypalSuccess;
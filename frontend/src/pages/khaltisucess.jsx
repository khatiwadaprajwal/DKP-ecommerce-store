import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
            <CheckCircle className="h-12 w-12 text-green-600" strokeWidth={3} />
          </div>
        </div>
        
        {/* Text Content */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Successful!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your purchase. Your payment has been processed and your order is confirmed.
        </p>

        {/* Order Details Box */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="font-mono font-medium text-gray-900 break-all">{orderId}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/order')} 
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <ShoppingBag size={20} />
            View My Orders
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-white text-gray-700 border-2 border-gray-100 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
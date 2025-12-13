import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                    The payment process was cancelled or failed.
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/cart')}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => navigate('/order')}
                        className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50"
                    >
                        Go to My Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
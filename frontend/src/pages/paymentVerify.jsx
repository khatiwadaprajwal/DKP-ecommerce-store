import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/api';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';

const PaymentVerify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed

    useEffect(() => {
        const verifyPayment = async () => {
            // 1. Capture Khalti/PayPal Parameters
            const pidx = searchParams.get('pidx'); 
            const transaction_id = searchParams.get('transaction_id'); 
            const paymentId = searchParams.get('paymentId'); 
            const PayerID = searchParams.get('PayerID'); 
            
            // Khalti V2 sends 'status' in the URL (Completed, UserCanceled, Expired)
            const khaltiStatus = searchParams.get('status'); 
            const purchase_order_id = searchParams.get('purchase_order_id'); // Your DB Order ID

            // -------------------------------------------
            // 🛑 HANDLE CANCELLATION / FAILURE
            // -------------------------------------------
            if (khaltiStatus === 'UserCanceled' || khaltiStatus === 'Expired' || khaltiStatus === 'Failed') {
                setStatus('failed');
                
                // If we have the Order ID, tell backend to mark it as Failed
                if (purchase_order_id) {
                    try {
                        await api.post('/v1/order/update-status', {
                            orderId: purchase_order_id,
                            status: 'Failed',
                            paymentStatus: 'Failed'
                        });
                    } catch (err) {
                        console.error("Failed to update order status", err);
                    }
                }

                toast.error(`Payment ${khaltiStatus}. Order marked as Failed.`);
                return;
            }

            // -------------------------------------------
            // ✅ HANDLE SUCCESS VERIFICATION
            // -------------------------------------------
            try {
                let response;

                // KHALTI
                if (pidx) {
                    response = await api.post('/v1/khalti/verify', { pidx });
                } 
                // PAYPAL
                else if (paymentId && PayerID) {
                    const orderId = searchParams.get('orderId'); // From PayPal return URL
                    response = await api.post('/v1/paypal/success', { paymentId, PayerID, orderId });
                }
                else {
                    // No credentials found
                    throw new Error("No payment credentials found.");
                }

                if (response.data.success || response.data.order) {
                    setStatus('success');
                    toast.success("Payment Successful!");
                    localStorage.removeItem("selectedCartItems"); 
                    setTimeout(() => navigate('/order'), 2500);
                } else {
                    throw new Error(response.data.message || "Verification failed");
                }

            } catch (error) {
                console.error("Verification Error:", error);
                setStatus('failed');
                toast.error("Payment failed. Please try again.");
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                
                {status === 'verifying' && (
                    <>
                        <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Verifying Payment...</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                        <p className="text-gray-500 mt-2">Your order is confirmed.</p>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
                        <p className="text-gray-500 mt-2">The transaction was cancelled or failed.</p>
                        <div className="mt-6 flex flex-col gap-3">
                            <button 
                                onClick={() => navigate('/cart')} 
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Try Again (Go to Cart)
                            </button>
                            <button 
                                onClick={() => navigate('/order')} 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                View My Orders
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentVerify;
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const PayPalPopup = ({ orderData, onClose, onSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState("processing"); // processing, success, error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        setIsLoading(true);
        // Simulate payment processing (replace with actual PayPal SDK integration)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Call your backend to complete the order
        const response = await fetch(`http://localhost:3001/v1/paypal/success?orderId=${orderData.orderId}&userId=${orderData.userId}&productIds=${orderData.productIds.join(',')}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${orderData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Payment confirmation failed');
        }
        
        setPaymentStatus("success");
        toast.success("Payment successful!");
        
        // Wait a moment before closing the popup
        setTimeout(() => {
          onSuccess();
        }, 1500);
        
      } catch (err) {
        console.error("Payment error:", err);
        setError(err.message || "Payment failed");
        setPaymentStatus("error");
        toast.error("Payment failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [orderData, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center py-6">
          {/* PayPal Logo */}
          <div className="mb-6">
            <svg width="100" height="26" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.11 25.64H2.661L0.25 9.48H5.699L8.11 25.64Z" fill="#253B80"/>
              <path d="M37.75 9.39H32.39C32.05 9.39 31.77 9.61 31.7 9.94L29.29 25.19C29.24 25.45 29.43 25.69 29.7 25.69H32.28C32.62 25.69 32.9 25.47 32.97 25.14L33.57 21.39C33.64 21.06 33.92 20.84 34.26 20.84H36.06C39.5 20.84 41.42 19.19 41.97 15.94C42.22 14.5 42 13.36 41.37 12.56C40.67 11.67 39.4 11.29 37.75 11.29V9.39ZM38.26 16.11C37.95 18 36.55 18 35.27 18H34.4L34.98 14.47C35.02 14.27 35.19 14.12 35.4 14.12H35.8C36.67 14.12 37.51 14.12 37.95 14.66C38.21 14.98 38.28 15.47 38.26 16.11Z" fill="#253B80"/>
              <path d="M57.52 16.05H54.93C54.72 16.05 54.55 16.2 54.51 16.4L54.39 17.14L54.2 16.88C53.67 16.16 52.54 15.91 51.42 15.91C48.95 15.91 46.86 17.76 46.44 20.36C46.22 21.66 46.56 22.89 47.34 23.75C48.06 24.55 49.07 24.86 50.27 24.86C52.27 24.86 53.37 23.61 53.37 23.61L53.25 24.35C53.2 24.61 53.39 24.85 53.66 24.85H56.01C56.35 24.85 56.63 24.63 56.7 24.3L58.03 16.55C58.08 16.29 57.89 16.05 57.62 16.05H57.52ZM54.02 20.41C53.8 21.66 52.81 22.5 51.57 22.5C50.95 22.5 50.46 22.32 50.13 21.97C49.81 21.63 49.69 21.14 49.8 20.57C50 19.34 51 18.48 52.23 18.48C52.84 18.48 53.33 18.67 53.67 19.01C54.01 19.37 54.13 19.85 54.02 20.41Z" fill="#253B80"/>
              <path d="M75.93 16.05H73.33C73.09 16.05 72.86 16.17 72.72 16.37L69.65 20.76L68.34 16.61C68.26 16.27 67.95 16.05 67.6 16.05H65.05C64.74 16.05 64.55 16.36 64.66 16.64L67.31 23.7L64.82 27.17C64.59 27.5 64.83 27.96 65.23 27.96H67.83C68.07 27.96 68.29 27.85 68.44 27.65L76.33 16.84C76.56 16.51 76.33 16.05 75.93 16.05Z" fill="#253B80"/>
              <path d="M84.4 9.39H79.04C78.7 9.39 78.42 9.61 78.35 9.94L75.94 25.19C75.89 25.45 76.08 25.69 76.35 25.69H79.2C79.43 25.69 79.63 25.52 79.67 25.3L80.3 21.39C80.37 21.06 80.65 20.84 80.99 20.84H82.79C86.23 20.84 88.15 19.19 88.7 15.94C88.95 14.5 88.73 13.36 88.1 12.56C87.4 11.67 86.13 11.29 84.48 11.29L84.4 9.39ZM84.91 16.11C84.6 18 83.2 18 81.92 18H81.05L81.63 14.47C81.67 14.27 81.84 14.12 82.05 14.12H82.45C83.32 14.12 84.16 14.12 84.6 14.66C84.86 14.98 84.93 15.47 84.91 16.11Z" fill="#179BD7"/>
              <path d="M96.18 16.05H93.59C93.38 16.05 93.21 16.2 93.17 16.4L93.05 17.14L92.86 16.88C92.33 16.16 91.2 15.91 90.08 15.91C87.61 15.91 85.52 17.76 85.1 20.36C84.88 21.66 85.22 22.89 86 23.75C86.72 24.55 87.73 24.86 88.93 24.86C90.93 24.86 92.03 23.61 92.03 23.61L91.91 24.35C91.86 24.61 92.05 24.85 92.32 24.85H94.67C95.01 24.85 95.29 24.63 95.36 24.3L96.69 16.55C96.74 16.29 96.55 16.05 96.28 16.05H96.18ZM92.68 20.41C92.46 21.66 91.47 22.5 90.23 22.5C89.61 22.5 89.12 22.32 88.79 21.97C88.47 21.63 88.35 21.14 88.46 20.57C88.66 19.34 89.66 18.48 90.89 18.48C91.5 18.48 91.99 18.67 92.33 19.01C92.67 19.37 92.79 19.85 92.68 20.41Z" fill="#179BD7"/>
              <path d="M98.74 9.83L96.27 25.19C96.22 25.45 96.41 25.69 96.68 25.69H98.94C99.28 25.69 99.56 25.47 99.63 25.14L102.04 9.89C102.09 9.63 101.9 9.39 101.63 9.39H99.15C98.94 9.39 98.77 9.54 98.73 9.74L98.74 9.83Z" fill="#179BD7"/>
              <path d="M21.61 12.53C20.91 11.64 19.64 11.26 17.99 11.26H12.64C12.3 11.26 12.02 11.48 11.95 11.81L9.54 27.06C9.49 27.32 9.68 27.56 9.95 27.56H13.08L13.89 22.37L13.88 22.45C13.95 22.12 14.22 21.9 14.56 21.9H16.36C19.8 21.9 21.72 20.25 22.27 17C22.28 16.98 22.28 16.95 22.29 16.93C22.52 15.58 22.32 14.49 21.61 12.53Z" fill="#253B80"/>
              <path d="M14.89 16.98C14.93 16.78 15.1 16.63 15.31 16.63H19.13C19.55 16.63 19.95 16.67 20.3 16.75C20.4 16.77 20.51 16.8 20.61 16.83C20.7 16.86 20.8 16.89 20.89 16.93C20.94 16.95 20.99 16.97 21.04 16.99C21.25 17.07 21.44 17.17 21.61 17.28C21.84 15.93 21.64 14.84 20.93 13.88C20.15 12.9 18.71 12.47 16.87 12.47H11.94C11.55 12.47 11.22 12.73 11.14 13.12L8.5 29.9C8.43 30.31 8.75 30.69 9.16 30.69H12.85L13.57 26.17L14.89 16.98Z" fill="#179BD7"/>
            </svg>
          </div>

          {/* Payment Status */}
          {isLoading && (
            <div className="mb-4 flex flex-col items-center">
              <div className="loader mb-4 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium">Processing your payment...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait, do not close this window.</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="mb-4 flex flex-col items-center">
              <div className="mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-lg font-medium">Payment Successful!</p>
              <p className="text-sm text-gray-500 mt-2">Your order has been placed.</p>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="mb-4 flex flex-col items-center">
              <div className="mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-lg font-medium">Payment Failed</p>
              <p className="text-sm text-red-500 mt-2">{error}</p>
              <button 
                onClick={onClose} 
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Order Details */}
          <div className="w-full border-t mt-4 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Order Total:</span>
              <span className="font-medium">Rs. {orderData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalPopup;
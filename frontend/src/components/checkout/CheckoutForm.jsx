import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KhaltiPayment from '../payment/KhaltiPayment';
import axios from 'axios';

const CheckoutForm = ({ cartItems, totalAmount }) => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [orderId, setOrderId] = useState(null);
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        address: '',
        city: '',
        phone: '',
        email: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const createOrder = async () => {
        try {
            const response = await axios.post('/api/order/create', {
                items: cartItems,
                totalAmount,
                shippingDetails,
                paymentMethod
            });

            if (response.data.success) {
                setOrderId(response.data.orderId);
                return response.data.orderId;
            }
        } catch (error) {
            console.error('Order creation failed:', error);
            alert('Failed to create order. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        const newOrderId = await createOrder();
        
        if (paymentMethod === 'COD') {
            navigate('/order-success');
        }
        // For Khalti, the payment process will be handled by the KhaltiPayment component
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={shippingDetails.fullName}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={shippingDetails.phone}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={shippingDetails.email}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={shippingDetails.address}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                name="city"
                                value={shippingDetails.city}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <div className="space-y-4">
                        <label className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="KHALTI"
                                checked={paymentMethod === 'KHALTI'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-4 w-4 text-blue-600"
                            />
                            <span>Pay with Khalti</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={paymentMethod === 'COD'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-4 w-4 text-blue-600"
                            />
                            <span>Cash on Delivery</span>
                        </label>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-4">
                    {paymentMethod === 'KHALTI' && orderId ? (
                        <KhaltiPayment amount={totalAmount} orderId={orderId} />
                    ) : (
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm; 
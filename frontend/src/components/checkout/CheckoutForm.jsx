import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/api'; 

const CheckoutForm = ({ cartItems, totalAmount }) => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        address: '',
        city: '', // Maps to "location" in backend
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        setLoading(true);

        // Note: Currently logic processes the first item (Buy Now flow).
        // If checking out a full cart, ensure your backend supports an array of items 
        // or loop through this logic.
        const itemToBuy = cartItems[0]; 

        const payload = {
            productId: itemToBuy.productId || itemToBuy.itemId || itemToBuy._id, // Handle various ID formats
            quantity: itemToBuy.quantity || 1,
            address: shippingDetails.address,
            location: shippingDetails.city,
            paymentMethod: paymentMethod,
            color: itemToBuy.color || "White",
            size: itemToBuy.size || "XS"
        };

        try {
            // ✅ api.post handles BaseURL and Auth Headers automatically
            const response = await api.post('/v1/place', payload);

            // Handle Khalti Redirect Response
            if (response.data.khaltiUrl) {
                window.location.href = response.data.khaltiUrl;
            } else {
                toast.success("Order placed successfully!");
                navigate('/order-success'); // Or /payment-success based on your routes
            }

        } catch (error) {
            console.error('Order creation failed:', error);
            
            // Safe error message handling
            const errorMsg = error.response?.data?.message || 'Failed to place order. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="e.g. Kathmandu, Nepal"
                                value={shippingDetails.address}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City / Location</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="e.g. Lalitpur"
                                value={shippingDetails.city}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <div className="space-y-4">
                        
                        {/* Khalti Option - Simple Blue Text */}
                        <label className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Khalti' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Khalti"
                                checked={paymentMethod === 'Khalti'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-4 w-4 text-blue-600"
                            />
                            <span className="text-lg font-bold text-[#5C2D91]">
                                Pay with Khalti
                            </span>
                        </label>

                        {/* COD Option */}
                        <label className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-gray-600 bg-gray-50' : 'border-gray-200'}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={paymentMethod === 'COD'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-4 w-4 text-gray-600"
                            />
                            <span className="text-gray-800 font-medium">Cash on Delivery</span>
                        </label>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>Rs. {totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>Rs. {totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors shadow-md
                        ${paymentMethod === 'Khalti' 
                            ? 'bg-[#5C2D91] hover:bg-[#4a2475]' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } 
                        ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing...' : (paymentMethod === 'Khalti' ? 'Pay with Khalti' : 'Place Order')}
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;
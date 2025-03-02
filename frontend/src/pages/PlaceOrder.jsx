import React, { useContext, useState } from "react";
import { ShopContext } from "../context/Shopcontext";
import { ToastContainer, toast } from "react-toastify";

const PlaceOrder = () => {
  const [selectedPayment, setSelectedPayment] = useState("");

  const { navigate, totalPrice, delivery_fee } = useContext(ShopContext);

  // Handle checkout
  const handlePlaceOrder = () => {
    if (selectedPayment.length === 0) {
      toast.error("Select at least one item to proceed to checkout!");
    } else {
      navigate("/Order");
    }
  };

  return (
    <div className="container min-h-180 py-6 ">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Delivery Information */}
        <div className="w-full lg:w-2/3">
        <div className="text-xl sm:text-2xl mb-6">
            <h2 className="font-semibold text-gray-900 border-b-2 border-gray-900 pb-2">
              CONTACT INFORMATION
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none col-span-1 sm:col-span-2"
              type="email"
              placeholder="Email address"
            />
          </div>
          
          <div className="text-xl sm:text-2xl mb-6">
            <h2 className="font-semibold text-gray-900 border-b-2 border-gray-900 pb-2">
              DELIVERY INFORMATION
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none"
              type="text"
              placeholder="First name"
            />
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none"
              type="text"
              placeholder="Last name"
            />
            
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none col-span-1 sm:col-span-2"
              type="text"
              placeholder="Street"
            />
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none"
              type="text"
              placeholder="City"
            />
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none"
              type="text"
              placeholder="State"
            />
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none"
              type="text"
              placeholder="Zipcode"
            />
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none"
              type="text"
              placeholder="Country"
            />
            <input
              className="border border-gray-300 rounded py-2 px-4 w-full focus:border-gray-500 focus:ring-1 focus:ring-black-500 outline-none col-span-1 sm:col-span-2"
              type="tel"
              placeholder="Phone"
            />
          </div>
        </div>

        {/* Right Column - Cart Details & Payment */}
        <div className="w-full lg:w-1/3">
          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-xl mb-4">
              <h2 className="font-semibold text-gray-900 border-b-2 border-gray-900 pb-2">
                ORDER TOTALS
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Subtotal</span>
                <span>Rs. {totalPrice}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Shipping Fee</span>
                <span>Rs. {delivery_fee}</span>
              </div>
              <div className="flex justify-between pt-3 font-bold text-lg">
                <span>Total</span>
                <span>Rs. {totalPrice + delivery_fee}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <div className="text-xl mb-4">
              <h2 className="font-semibold text-gray-900 border-b-2 border-gray-900 pb-2">
                PAYMENT METHOD
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div
                className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === "stripe"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedPayment("stripe")}
              >
                <div className="h-8 flex items-center justify-center">
                  <span className="text-blue-500 font-medium">stripe</span>
                </div>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === "razorpay"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedPayment("razorpay")}
              >
                <div className="h-8 flex items-center justify-center">
                  <span className="font-medium">Razorpay</span>
                </div>
              </div>

              <div
                className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPayment === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
                onClick={() => setSelectedPayment("cash")}
              >
                <div className="h-8 flex items-center justify-center">
                  <span className="font-medium text-xs sm:text-sm">
                    CASH ON DELIVERY
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/order")}
              className="w-full bg-black text-white font-semibold py-3 px-4 rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;

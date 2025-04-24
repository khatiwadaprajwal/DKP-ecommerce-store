import React from "react";

const ShippingInfo = () => {
  return (
    <div className="space-y-6 text-lg">
      <div className="flex items-start bg-gray-50 p-4 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-3 mt-1 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div>
          <h3 className="font-medium text-gray-900">Delivery Time</h3>
          <p className="text-gray-700 mt-1">
            Delivery within 3-7 business days.
          </p>
        </div>
      </div>

      <div className="flex items-start bg-gray-50 p-4 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-3 mt-1 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <div>
          <h3 className="font-medium text-gray-900">Free Shipping</h3>
          <p className="text-gray-700 mt-1">
            Free shipping on orders over Rs. 2000.
          </p>
        </div>
      </div>

      <div className="flex items-start bg-gray-50 p-4 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-3 mt-1 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <div>
          <h3 className="font-medium text-gray-900">
            Returns & Exchanges
          </h3>
          <p className="text-gray-700 mt-1">
            Easy return and exchange within 7 days of delivery.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
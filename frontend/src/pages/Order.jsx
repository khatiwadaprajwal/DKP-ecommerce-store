import React, { useContext } from 'react';
import { ShopContext } from '../context/Shopcontext';

const Order = () => {
  const { products, currency = "Rs" } = useContext(ShopContext);
  
  // Using sample products if needed for testing
  const orderedProducts = products?.slice(1, 4) || [
    {
      id: 1,
      name: "Men Round Neck Pure Cotton T-shirt",
      price: 200,
      image: ["/images/pink-tshirt.jpg"],
      size: "M",
      quantity: 1
    },
    {
      id: 2,
      name: "Girls Round Neck Cotton Top",
      price: 220,
      image: ["/images/floral-top.jpg"],
      size: "M",
      quantity: 1
    },
    {
      id: 3,
      name: "Men Round Neck Pure Cotton T-shirt",
      price: 110,
      image: ["/images/black-tshirt.jpg"],
      size: "M",
      quantity: 1
    }
  ];

  return (
    <div className="py-8 min-h-screen">
      <div className=" mx-auto">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="text-gray-600 mt-1 mb-6">View and track your recent purchases</p>
        
        <div className="space-y-4">
          {orderedProducts.map((item, index) => (
            <div key={index} className="bg-white rounded shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-40px p-4">
                  <img 
                    src={item.image[0]} 
                    alt={item.name} 
                    className="w-full h-40 object-cover object-center rounded"
                  />
                </div>
                
                <div className="md:w-3/4 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-medium text-gray-800">{item.name}</h2>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Delivered</span>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="font-medium">Price:</span> {currency} {item.price}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {item.quantity || 1}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {item.size || "M"}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      Ordered on <span>25 July, 2025</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">
                      Track
                    </button>
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {orderedProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded shadow-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-700">No orders yet</h3>
              <p className="text-gray-500 mt-1">Looks like you haven't placed any orders</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Browse Collection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
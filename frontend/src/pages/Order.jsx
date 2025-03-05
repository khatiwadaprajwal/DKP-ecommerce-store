import React, { useState, useContext, Fragment } from 'react';
import { ShopContext } from '../context/Shopcontext';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ShoppingBagIcon, 
  InformationCircleIcon, 
  PrinterIcon, 
  ReceiptRefundIcon 
} from '@heroicons/react/24/outline';


const Order = () => {
  const { products, currency = "Rs", navigate } = useContext(ShopContext);
  const [selectedOrder, setSelectedOrder] = useState(null);



  // Transform products into order-like structure
  const orders = products.map((product, index) => ({
    id: `ORD-${index + 5700}`,
    customer: {
      name: 'Current User',
      email: 'user@example.com',
      phone: '(555) 123-4567'
    },
    date: product.date,
    status: product.bestseller ? 'Popular' : 'Standard',
    payment: {
      method: 'Credit Card',
      status: 'Paid'
    },
    total: product.price,
    items: [{
      id: product._id,
      name: product.name,
      quantity: 1,
      price: product.price,
      size: product.sizes[0], // Take first available size
      category: product.category,
      subCategory: product.subCategory
    }],
    shipping: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    },
    description: product.description
  }));

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="py-8 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your recent purchases</p>
          </div>
          <div className="flex space-x-2">
            <button  onClick={()=>navigate('/collection')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center hover:cursor-pointer">
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-500">Order ID: {order.id}</span>
                  <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                    order.status === 'Popular' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Ordered on {new Date(order.date).toLocaleDateString()}
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center space-x-4 border-b pb-2 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image ? item.image[0] : "/images/placeholder-product.jpg"} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500">
                          {item.category} / {item.subCategory}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: {currency} {order.total.toFixed(2)}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details Modal */}
        <Transition appear show={!!selectedOrder} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-10" 
            onClose={closeModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title 
                      as="h3" 
                      className="text-2xl font-bold leading-6 text-gray-900 flex justify-between items-center"
                    >
                      Order Details
                      <span className="text-sm text-gray-500">{selectedOrder?.id}</span>
                    </Dialog.Title>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Product Information</h4>
                        <p className="font-medium">{selectedOrder?.items[0].name}</p>
                        <p className="text-sm text-gray-600">{selectedOrder?.description}</p>
                        <p className="mt-2">
                          <span className="font-medium">Category:</span> {selectedOrder?.items[0].category}
                          <span className="ml-2 text-gray-500">
                            {selectedOrder?.items[0].subCategory}
                          </span>
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700">Order Details</h4>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(selectedOrder?.date).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span> {selectedOrder?.status}
                        </p>
                        <p>
                          <span className="font-medium">Available Sizes:</span> 
                          {selectedOrder?.items[0].sizes?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Order Summary</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Product</th>
                            <th className="p-2 text-center">Quantity</th>
                            <th className="p-2 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder?.items.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-2">{item.name}</td>
                              <td className="p-2 text-center">1</td>
                              <td className="p-2 text-right">{currency} {item.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td colSpan="2" className="p-2 text-right">Total:</td>
                            <td className="p-2 text-right">{currency} {selectedOrder?.total.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <PrinterIcon className="h-5 w-5 mr-2" /> Print Invoice
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                          <ReceiptRefundIcon className="h-5 w-5 mr-2" /> Reorder
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Order;
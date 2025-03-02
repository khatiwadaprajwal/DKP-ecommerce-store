// File: src/pages/ListOrders.js
import React, { useState, useEffect } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';



const ListOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  
  const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  useEffect(() => {
    // Fetch orders
    const fetchOrders = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        


        

        // Mock data
        const mockOrders = [
          {
            id: 'ORD-5723',
            customer: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '(555) 123-4567'
            },
            date: '2025-02-28',
            status: 'Delivered',
            payment: {
              method: 'Credit Card',
              status: 'Paid'
            },
            total: 245.99,
            items: [
              { id: 1, name: "Men's Cotton T-Shirt", quantity: 2, price: 29.99 },
              { id: 3, name: "Unisex Hoodie", quantity: 1, price: 49.99 },
              { id: 5, name: "Leather Belt", quantity: 1, price: 19.99 }
            ],
            shipping: {
              address: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001'
            }
          },
          {
            id: 'ORD-5722',
            customer: {
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              phone: '(555) 987-6543'
            },
            date: '2025-03-01',
            status: 'Processing',
            payment: {
              method: 'PayPal',
              status: 'Paid'
            },
            total: 129.50,
            items: [
              { id: 2, name: "Women's Casual Jeans", quantity: 1, price: 59.99 },
              { id: 5, name: "Leather Belt", quantity: 1, price: 19.99 }
            ],
            shipping: {
              address: '456 Oak Ave',
              city: 'Boston',
              state: 'MA',
              zip: '02108'
            }
          },
          {
            id: 'ORD-5721',
            customer: {
              name: 'Robert Johnson',
              email: 'robert.johnson@example.com',
              phone: '(555) 456-7890'
            },
            date: '2025-03-01',
            status: 'Cancelled',
            payment: {
              method: 'Credit Card',
              status: 'Refunded'
            },
            total: 189.00,
            items: [
              { id: 6, name: "Women's Floral Dress", quantity: 1, price: 69.99 },
              { id: 4, name: "Kids Summer Shorts", quantity: 2, price: 24.99 }
            ],
            shipping: {
              address: '789 Pine Blvd',
              city: 'Chicago',
              state: 'IL',
              zip: '60601'
            }
          },
          {
            id: 'ORD-5720',
            customer: {
              name: 'Sarah Wilson',
              email: 'sarah.wilson@example.com',
              phone: '(555) 789-0123'
            },
            date: '2025-02-27',
            status: 'Shipped',
            payment: {
              method: 'Credit Card',
              status: 'Paid'
            },
            total: 159.97,
            items: [
              { id: 3, name: "Unisex Hoodie", quantity: 2, price: 49.99 },
              { id: 5, name: "Leather Belt", quantity: 3, price: 19.99 }
            ],
            shipping: {
              address: '321 Maple Dr',
              city: 'Seattle',
              state: 'WA',
              zip: '98101'
            }
          },
          {
            id: 'ORD-5719',
            customer: {
              name: 'Michael Brown',
              email: 'michael.brown@example.com',
              phone: '(555) 321-6547'
            },
            date: '2025-02-26',
            status: 'Pending',
            payment: {
              method: 'PayPal',
              status: 'Pending'
            },
            total: 89.98,
            items: [
              { id: 1, name: "Men's Cotton T-Shirt", quantity: 3, price: 29.99 }
            ],
            shipping: {
              address: '654 Cedar Ln',
              city: 'Miami',
              state: 'FL',
              zip: '33101'
            }
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(
      orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // In a real app, you would make an API call here
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <div className="text-sm text-gray-500">
          Total Orders: {orders.length}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{order.customer.name}</div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{order.payment.method}</div>
                        <div className="text-xs text-gray-500">{order.payment.status}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setShowOrderDetails(showOrderDetails === order.id ? null : order.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    
                    {showOrderDetails === order.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-2">Order Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-sm">Customer Information</h4>
                                <p className="text-sm">{order.customer.name}</p>
                                <p className="text-sm">{order.customer.email}</p>
                                <p className="text-sm">{order.customer.phone}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">Shipping Address</h4>
                                <p className="text-sm">{order.shipping.address}</p>
                                <p className="text-sm">{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">Payment Information</h4>
                                <p className="text-sm">Method: {order.payment.method}</p>
                                <p className="text-sm">Status: {order.payment.status}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium text-sm mb-2">Order Items</h4>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {order.items.map(item => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm">{item.name}</td>
                                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm">${item.price.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm">${(item.price * item.quantity).toFixed(2)}</td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-50">
                                  <td colSpan="3" className="px-4 py-2 text-sm font-medium text-right">Order Total:</td>
                                  <td className="px-4 py-2 text-sm font-medium">${order.total.toFixed(2)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Update Order Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {statusOptions.filter(status => status !== 'All').map(status => (
                                <button
                                  key={status}
                                  onClick={() => updateOrderStatus(order.id, status)}
                                  className={`px-3 py-1 text-xs rounded ${
                                    order.status === status
                                      ? getStatusBadgeClass(status)
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListOrders;
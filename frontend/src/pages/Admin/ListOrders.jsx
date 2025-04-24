import React, { useState, useEffect } from 'react';
import { EyeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import axios from "axios";

const ListOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  
  const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const paymentMethods = ['Cash', 'PayPal'];
  const paymentStatuses = ['Pending', 'Paid', 'Failed'];
  
  useEffect(() => {
    // Fetch orders
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/v1/getallorder", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Check if response contains orders
        if (response.data && response.data.orders) {
          setOrders(response.data.orders);
          // console.log(response.data.orders)
        } else {
          setOrders([]);
          setError("No orders found or invalid response format");
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.response?.data?.error || "Failed to fetch orders. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [token]);
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:3001/v1/change-status/${orderId}`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // console.log(response.data.order);
      if (response.data && response.data.order) {
        // Update local state with the updated order
        setOrders(
          orders.map(order => 
            order._id === orderId ? response.data.order : order
          )
        );
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      alert("Failed to update order status. " + (error.response?.data?.error || "Please try again."));
    }
  };
  
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      // Note: Backend doesn't have a specific endpoint for payment status updates
      // You might need to create one, but for now we'll just update the UI
      setOrders(
        orders.map(order => 
          order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        )
      );
      alert("Payment status update API endpoint not implemented in backend.");
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert("Failed to update payment status. Please try again.");
    }
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
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order._id && order._id.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (order.userId && order.userId.name && order.userId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.userId && order.userId.email && order.userId.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotalItems = (orderItems) => {
    if (!orderItems || !Array.isArray(orderItems)) return 0;
    return orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Generate Google Maps link from latitude and longitude
  const generateGoogleMapsLink = (lat, lng) => {
    if (!lat || !lng) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  // Navigate to Google Maps
  const openGoogleMaps = (lat, lng) => {
    const mapsUrl = generateGoogleMapsLink(lat, lng);
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    }
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
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
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
                filteredOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        #{order._id && order._id.substring(order._id.length - 6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{order.userId?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.userId?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(order.orderDate || order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                          {order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{order.paymentMethod || 'N/A'}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        Rs.{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setShowOrderDetails(showOrderDetails === order._id ? null : order._id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    
                    {showOrderDetails === order._id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="mb-4">
                            <h3 className="font-semibold text-lg mb-2">Order Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-sm">Customer Information</h4>
                                <p className="text-sm">{order.userId?.name || 'N/A'}</p>
                                <p className="text-sm">{order.userId?.email || 'N/A'}</p>
                                <p className="text-sm">{order.userId?.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">Shipping Address</h4>
                                <p className="text-sm">{order.address || 'N/A'}</p>
                                {order.location && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-1">
                                      Lat: {order.location.lat}, Long: {order.location.lng}
                                    </p>
                                    <button
                                      onClick={() => openGoogleMaps(order.location.lat, order.location.lng)}
                                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                                    >
                                      <MapPinIcon className="h-4 w-4" />
                                      View on Google Maps
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">Payment Information</h4>
                                <p className="text-sm">Method: {order.paymentMethod || 'N/A'}</p>
                                <p className="text-sm">Status: {order.paymentStatus || 'N/A'}</p>
                                {order.paymentId && (
                                  <p className="text-sm">Transaction ID: {order.paymentId}</p>
                                )}
                                <p className="text-sm">Currency: {'NRP'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium text-sm mb-2">Order Items ({calculateTotalItems(order.orderItems)} items)</h4>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product ID</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {order.orderItems && order.orderItems.map(item => (
                                  <tr key={item._id}>
                                    <td className="px-4 py-2 text-sm">{item.productId?._id|| 'N/A'}</td>
                                    <td className="px-4 py-2 text-sm">{item.productId?.productName || 'N/A'}</td>
                                    <td className="px-4 py-2 text-sm">{item.quantity || 0}</td>
                                    <td className="px-4 py-2 text-sm">Rs.{item.price ? item.price.toFixed(2) : '0.00'}</td>
                                    <td className="px-4 py-2 text-sm">Rs.{item.totalPrice ? item.totalPrice.toFixed(2) : '0.00'}</td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-50">
                                  <td colSpan="4" className="px-4 py-2 text-sm font-medium text-right">Order Total:</td>
                                  <td className="px-4 py-2 text-sm font-medium">Rs.{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium text-sm mb-2">Update Order Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {statusOptions.filter(status => status !== 'All').map(status => (
                                <button
                                  key={status}
                                  onClick={() => updateOrderStatus(order._id, status)}
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
                          
                          
                          <div className="mt-4 text-xs text-gray-500">
                            <p>Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                            <p>Last Updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}</p>
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
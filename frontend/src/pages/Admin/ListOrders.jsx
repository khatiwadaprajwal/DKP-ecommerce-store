import React, { useState, useEffect, useRef } from 'react';
import { EyeIcon, MapPinIcon, Download } from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";


import api from "../../config/api";
import { useAuth } from "../../context/AuthProvider";

const ListOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [qrOrder, setQrOrder] = useState(null);
  
  const qrRef = useRef(null);
  const { token } = useAuth(); // ✅ Get token
  
  const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const paymentStatuses = ['Pending', 'Paid', 'Failed'];
  
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.get("/v1/getallorder");
        if (response.data && response.data.orders) {
          setOrders(response.data.orders);
          setError(null);
        } else {
          setOrders([]);
          setError("No orders found");
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.response?.data?.error || "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
        fetchOrders();
    }
  }, [token]); 
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/v1/change-status/${orderId}`, { status: newStatus });
      if (response.data && response.data.order) {
        setOrders(orders.map(order => 
          order._id === orderId ? response.data.order : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert("Failed to update order status.");
    }
  };
  
  // ... (updatePaymentStatus function remains the same) ...
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
      ));
      alert("Note: This is a UI update only. Backend endpoint connection required.");
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateTotalItems = (orderItems) => {
    if (!orderItems || !Array.isArray(orderItems)) return 0;
    return orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `order-qr-${qrOrder._id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + window.btoa(svgData);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">Orders</h2>
        <div className="text-sm text-gray-500">Total: {orders.length}</div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders..."
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
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading orders...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          {/* 📱 MOBILE VIEW: Cards */}
          <div className="md:hidden space-y-4">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-gray-500">No orders found</p>
            ) : (
              filteredOrders.map(order => (
                <div key={order._id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-3">
                     <div>
                        <span className="font-bold text-gray-900">#{order._id.slice(-6)}</span>
                        <div className="text-xs text-gray-500">{formatDate(order.orderDate)}</div>
                     </div>
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                     </span>
                  </div>

                  {/* Info Row */}
                  <div className="mb-3 text-sm">
                     <p><strong>Customer:</strong> {order.userId?.name || 'N/A'}</p>
                     <p><strong>Total:</strong> {order.currency || 'NPR'} {order.totalAmount?.toFixed(2)}</p>
                     <p><strong>Payment:</strong> {order.paymentMethod} <span className={`text-xs ml-1 px-1.5 rounded ${getStatusBadgeClass(order.paymentStatus)}`}>{order.paymentStatus}</span></p>
                  </div>

                  {/* Actions Row */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                    <button onClick={() => setQrOrder(order)} className="text-green-600 flex items-center text-xs font-medium">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                         <path d="M2 2h2v2H2V2zm0 10h2v2H2v-2zM12 2h2v2h-2V2zm0 10h2v2h-2v-2zM4 1H1v3h3V1zm0 10H1v3h3v-3zM14 1h-3v3h3V1zm0 10h-3v3h3v-3zM3 3v1h1V3H3zm0 10v1h1v-1H3zm10-10v1h1V3h-1zm0 10v1h1v-1h-1z"/>
                       </svg>
                       QR Code
                    </button>
                    <button 
                      onClick={() => setShowOrderDetails(showOrderDetails === order._id ? null : order._id)}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs font-medium flex items-center"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {showOrderDetails === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Mobile Expand Details */}
                  {showOrderDetails === order._id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm bg-white p-3 rounded">
                       <h4 className="font-bold text-gray-700 mb-2">Order Items</h4>
                       <ul className="space-y-2 mb-4">
                         {order.orderItems?.map((item, idx) => (
                           <li key={idx} className="flex justify-between text-xs border-b pb-1">
                             <span>{item.productId?.productName || 'Unknown'} (x{item.quantity})</span>
                             <span>{order.currency} {item.totalPrice?.toFixed(2)}</span>
                           </li>
                         ))}
                       </ul>

                       <h4 className="font-bold text-gray-700 mb-2">Update Status</h4>
                       <div className="flex flex-wrap gap-2 mb-4">
                          {statusOptions.filter(s => s !== 'All').map(status => (
                             <button 
                                key={status}
                                onClick={() => updateOrderStatus(order._id, status)}
                                className={`px-2 py-1 text-xs border rounded ${order.status === status ? 'bg-blue-600 text-white' : 'bg-white'}`}
                             >
                                {status}
                             </button>
                          ))}
                       </div>

                       <h4 className="font-bold text-gray-700 mb-2">Payment Status</h4>
                       <div className="flex flex-wrap gap-2">
                          {paymentStatuses.map(status => (
                             <button 
                                key={status}
                                onClick={() => updatePaymentStatus(order._id, status)}
                                className={`px-2 py-1 text-xs border rounded ${order.paymentStatus === status ? 'bg-green-600 text-white' : 'bg-white'}`}
                             >
                                {status}
                             </button>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 💻 LAPTOP VIEW: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No orders found</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">#{order._id.slice(-6)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{order.userId?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.userId?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.orderDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{order.paymentMethod}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(order.paymentStatus)}`}>{order.paymentStatus}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {order.currency || 'NPR'} {order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => setShowOrderDetails(showOrderDetails === order._id ? null : order._id)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => setQrOrder(order)} className="text-green-600 hover:text-green-900">
                             {/* SVG QR Icon */}
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                               <path d="M2 2h2v2H2V2zm0 10h2v2H2v-2zM12 2h2v2h-2V2zm0 10h2v2h-2v-2zM4 1H1v3h3V1zm0 10H1v3h3v-3zM14 1h-3v3h3V1zm0 10h-3v3h3v-3zM3 3v1h1V3H3zm0 10v1h1v-1H3zm10-10v1h1V3h-1zm0 10v1h1v-1h-1z"/>
                             </svg>
                          </button>
                        </td>
                      </tr>
                      {showOrderDetails === order._id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                             {/* Expanded Order Details (Desktop) */}
                             <div className="grid grid-cols-3 gap-6 mb-4">
                                <div>
                                   <h4 className="font-bold mb-2">Shipping Info</h4>
                                   <p className="text-sm">{order.address}</p>
                                   {order.location && (
                                     <button onClick={() => window.open(`https://maps.google.com/?q=${order.location.lat},${order.location.lng}`)} className="text-blue-600 text-xs mt-1 flex items-center">
                                        <MapPinIcon className="h-3 w-3 mr-1"/> Google Maps
                                     </button>
                                   )}
                                </div>
                                <div>
                                   <h4 className="font-bold mb-2">Order Items</h4>
                                   <ul className="text-sm space-y-1">
                                      {order.orderItems?.map((item, i) => (
                                         <li key={i}>{item.productId?.productName} (x{item.quantity}) - {item.size}/{item.color}</li>
                                      ))}
                                   </ul>
                                </div>
                                <div>
                                   <h4 className="font-bold mb-2">Actions</h4>
                                   <div className="flex gap-2 flex-wrap mb-2">
                                      {statusOptions.filter(s => s !== 'All').map(s => (
                                         <button key={s} onClick={() => updateOrderStatus(order._id, s)} className={`px-2 py-0.5 text-xs border rounded ${order.status === s ? 'bg-blue-600 text-white' : 'bg-white'}`}>{s}</button>
                                      ))}
                                   </div>
                                   <div className="flex gap-2 flex-wrap">
                                      {paymentStatuses.map(s => (
                                         <button key={s} onClick={() => updatePaymentStatus(order._id, s)} className={`px-2 py-0.5 text-xs border rounded ${order.paymentStatus === s ? 'bg-green-600 text-white' : 'bg-white'}`}>{s}</button>
                                      ))}
                                   </div>
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
        </>
      )}

      {/* QR Code Modal (Responsive) */}
      {qrOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm md:max-w-md relative">
            <button onClick={() => setQrOrder(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl">×</button>
            <h3 className="text-xl font-bold mb-4 text-center">Order QR Code</h3>
            <div ref={qrRef} className="flex flex-col items-center">
              <QRCodeSVG
                value={JSON.stringify({
                  id: qrOrder._id,
                  user: qrOrder.userId?.name,
                  amt: qrOrder.totalAmount,
                  status: qrOrder.status
                })}
                size={250}
                className="mb-4"
              />
              <button onClick={downloadQRCode} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                 <Download size={18} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrders;
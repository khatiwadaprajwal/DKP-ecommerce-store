import React, { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ShoppingBagIcon,
  InformationCircleIcon,
  ReceiptRefundIcon,
  CreditCardIcon, 
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ Changed to match your Login/Register
import PrintInvoice from "../component/PrintInvoice";


import api from "../config/api";

import { useAuth } from "../context/AuthProvider";

const Order = () => {
  // ✅ Use standard hooks instead of ShopContext for these
  const navigate = useNavigate();
  const { token } = useAuth(); 
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      // If no token, don't fetch (or redirect)
      if (!token) return;

      try {
        setLoading(true);
        // ✅ Use api.get (BaseURL and Headers are handled automatically)
        const response = await api.get("/v1/myorders");

        if (response.data && response.data.success) {
          let fetchedOrders = response.data.orders;

          // ---------------------------------------------------------------
          // 🟢 NEW FUNCTIONALITY: Auto-Check Khalti Payment Status
          // ---------------------------------------------------------------
          // This looks for Pending Khalti orders and checks if they are actually Paid
          const pendingKhaltiOrders = fetchedOrders.filter(
            (o) => o.paymentMethod === "Khalti" && o.status === "Pending" && o.paymentStatus !== "Paid"
          );

          
          // ---------------------------------------------------------------
          // 🔴 END NEW FUNCTIONALITY
          // ---------------------------------------------------------------

          setOrders(fetchedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err.response?.data?.error ||
          "Failed to load your orders. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // ✅ Handle Khalti Payment Navigation
  const handleKhaltiPayment = async (orderId) => {
    try {
      setPaymentLoading(true);
      
      // ✅ Use api.post (Auto headers)
      const response = await api.post("/v1/khalti/pay-order", { orderId });

      if (response.data && response.data.khaltiUrl) {
        // Redirect to Khalti
        window.location.href = response.data.khaltiUrl;
      } else {
        toast.error("Unable to initiate Khalti payment.");
      }
    } catch (err) {
      console.error("Khalti Error:", err);
      toast.error(err.response?.data?.message || "Failed to connect to Khalti.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this order?"
      );
      if (!confirmed) return;

      // ✅ Use api.delete (Auto headers)
      const response = await api.delete(`/v1/cancel/${orderId}`);

      if (response.data && response.data.message) {
        // Refresh orders list locally
        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        );
        setOrders(updatedOrders);

        // If currently viewing this order, update selected order too
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: "Cancelled" });
        }

        toast.success("Order cancelled successfully");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error(
        err.response?.data?.error || "Failed to cancel order. Please try again."
      );
    }
  }
  // Loading state
  if (loading) {
    return (
      <div className="py-8 min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8 min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-xl mb-4">
            <InformationCircleIcon className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No orders state
  if (!orders || orders.length === 0) {
    return (
      <div className="py-8 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">
                Track and manage your purchases
              </p>
            </div>
            <div>
              <button
                onClick={() => navigate("/collection")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Start Shopping
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingBagIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/collection")}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-8 min-h-screen bg-gray-50 text-lg">
      <div className="container mx-auto px-4">
        {/* MOBILE FIX: Stacked layout on mobile using flex-col md:flex-row */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your purchases
            </p>
          </div>
          <div className="flex space-x-2 w-full md:w-auto justify-center md:justify-end">
            <button
              onClick={() => navigate("/collection")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center hover:cursor-pointer"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Order ID: {order._id}
                  </span>
                 <span
  className={`ml-4 px-2 py-1 text-xs rounded-full ${
    order.status === "Delivered"
      ? "bg-green-100 text-green-800"
      : order.status === "Cancelled"
      ? "bg-red-100 text-red-800"
      : order.status === "Failed"
      ? "bg-red-100 text-red-800" 
      : order.status === "Shipped"
      ? "bg-blue-100 text-blue-800"
      : order.status === "Processing"
      ? "bg-purple-100 text-purple-800"
      : "bg-yellow-100 text-yellow-800"
  }`}
>
  {order.status}
</span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(order.orderDate || order.createdAt)}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.orderItems &&
                    order.orderItems.map((item) => {
                      // ✅ SMART IMAGE HELPER INSIDE MAP
                      const rawImg = item.productId?.images && item.productId.images.length > 0 
                        ? item.productId.images[0] 
                        : "";
                      
                      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
                      const finalImg = (rawImg.startsWith("http") || rawImg.startsWith("https"))
                        ? rawImg
                        : `${BACKEND_URL}/public/${rawImg}`;

                      return (
                        <div
                          key={item._id}
                          className="flex items-center space-x-4 pb-2 last:border-b-0"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded flex items-center justify-center">
                              {rawImg ? (
                                <img
                                  src={finalImg}
                                  alt={item.productId?.productName || "Product"}
                                  className="w-16 h-16 object-cover"
                                  onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                                />
                              ) : (
                                <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.productId?.productName || "Product"}
                            </h3>
                            <div className="flex space-x-4">
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity || 1}
                              </p>
                              {item.color && (
                                <p className="text-xs text-gray-500">
                                  Color: {item.color}
                                </p>
                              )}
                              {item.size && (
                                <p className="text-xs text-gray-500">
                                  Size: {item.size}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Price: {`NPR`} {item.price?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* MOBILE FIX: Stacked Footer (Total Amount + Buttons) */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      Total: {`NPR`} {order.totalAmount?.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.paymentMethod && (
                        <span className="mr-2">
                          Payment: {order.paymentMethod}
                        </span>
                      )}
                      {order.paymentStatus && (
                        <span className={`px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Buttons Section */}
                  <div className="flex space-x-2 w-full sm:w-auto justify-end">
                    
                    {/* ❌ REMOVED KHALTI BUTTON FROM HERE */}

                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    {(order.status === "Pending" || order.status === "Processing") && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details Modal (UNCHANGED) */}
        <Transition appear show={!!selectedOrder} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                      <span className="text-sm text-gray-500">
                        {selectedOrder?._id}
                      </span>
                    </Dialog.Title>

                    {/* Modal Details Section */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">
                          Order Information
                        </h4>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {selectedOrder?.orderDate
                            ? formatDate(selectedOrder.orderDate)
                            : formatDate(selectedOrder?.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              selectedOrder?.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : selectedOrder?.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : selectedOrder?.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : selectedOrder?.status === "Processing"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedOrder?.status}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Payment Method:</span>{" "}
                          {selectedOrder?.paymentMethod || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Payment Status:</span>{" "}
                          <span
                            className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                              selectedOrder?.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-800"
                                : selectedOrder?.paymentStatus === "Failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedOrder?.paymentStatus || "N/A"}
                          </span>
                        </p>
                        {selectedOrder?.paymentId && (
                          <p>
                            <span className="font-medium">Payment ID:</span>{" "}
                            {selectedOrder.paymentId}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Currency:</span>{" "}
                          {`NPR`}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700">
                          Shipping Address
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedOrder?.address || "N/A"}
                        </p>
                        {selectedOrder?.location && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              Location coordinates:
                            </p>
                            <p className="text-xs text-gray-500">
                              Lat: {selectedOrder.location.lat}, Lng:{" "}
                              {selectedOrder.location.lng}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Order Summary
                      </h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Product</th>
                            <th className="p-2 text-center">Quantity</th>
                            <th className="p-2 text-center">Size</th>
                            <th className="p-2 text-center">Color</th>
                            <th className="p-2 text-right">Price</th>
                            <th className="p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder?.orderItems &&
                            selectedOrder.orderItems.map((item) => (
                              <tr key={item._id} className="border-b">
                                <td className="p-2">
                                  {item.productId?.productName || "Product"}
                                </td>
                                <td className="p-2 text-center">
                                  {item.quantity || 1}
                                </td>
                                <td className="p-2 text-center">
                                  {item.size || "N/A"}
                                </td>
                                <td className="p-2 text-center">
                                  {item.color || "N/A"}
                                </td>
                                <td className="p-2 text-right">
                                  {`NPR`}{" "}
                                  {(item.price || 0).toFixed(2)}
                                </td>
                                <td className="p-2 text-right">
                                  {`NPR`}{" "}
                                  {(item.totalPrice || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td colSpan="5" className="p-2 text-right">
                              Total:
                            </td>
                            <td className="p-2 text-right">
                              {`NPR`}{" "}
                              {selectedOrder?.totalAmount?.toFixed(2) || "0.00"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {selectedOrder?.transactionDetails && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Transaction Details
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-32">
                          <pre>{JSON.stringify(selectedOrder.transactionDetails, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                      <div className="flex space-x-2">
                        {selectedOrder && <PrintInvoice order={selectedOrder} />}
                        
                        {(selectedOrder?.status === "Pending" || selectedOrder?.status === "Processing") && (
                          <button
                            onClick={() => {
                              handleCancelOrder(selectedOrder._id);
                              closeModal();
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                          >
                            <ReceiptRefundIcon className="h-4 w-4 mr-1" />
                            Cancel Order
                          </button>
                        )}
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
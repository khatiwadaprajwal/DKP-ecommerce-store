import React, { useState, useContext, Fragment, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Dialog, Transition } from "@headlessui/react";
import {
  ShoppingBagIcon,
  InformationCircleIcon,
  PrinterIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

const Order = () => {
  const { currency = "Rs", navigate, token } = useContext(ShopContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Use your API endpoint
        const response = await axios.get(
          "http://localhost:3001/v1/myorders",
          // {
          //   withCredentials: true, // This is important for sending cookies with the request
          // },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.success) {
          setOrders(response.data.orders);
        } else {
          // If API returns success: false but with a message
          setOrders([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err.response?.data?.error ||
            "Failed to load your orders. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // console.log(orders);

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

      const response = await axios.delete(
        `http://localhost:3001/v1/cancel/${orderId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.message) {
        // Refresh orders list
        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        );
        setOrders(updatedOrders);

        // If currently viewing this order, update selected order too
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: "Cancelled" });
        }

        alert("Order cancelled successfully");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(
        err.response?.data?.error || "Failed to cancel order. Please try again."
      );
    }
  };

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
          <div className="flex space-x-2">
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
                  {order.orderDate
                    ? `Ordered on ${new Date(
                        order.orderDate
                      ).toLocaleDateString()}`
                    : `Ordered on ${new Date(
                        order.createdAt
                      ).toLocaleDateString()}`}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.orderItems &&
                    order.orderItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center space-x-4  pb-2 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16  rounded flex items-center justify-center">
                            {/* Placeholder if no image */}
                            <img
                              src={`http://localhost:3001/public/${item.productId?.images[0]}`}
                              alt={item.productId?.productName || "Product"}
                              className="w-16 h-16 object-cover "
                            />
                            {/* <ShoppingBagIcon className="h-8 w-8 text-gray-400" /> */}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.productId?.productName || "Product"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Quantity: {item.quantity || 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            Price: {currency} {item.price?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: {order.currency || currency}{" "}
                    {order.totalAmount?.toFixed(2)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    {order.status === "Pending" && (
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

        {/* Order Details Modal */}
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

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">
                          Order Information
                        </h4>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {selectedOrder?.orderDate
                            ? new Date(
                                selectedOrder.orderDate
                              ).toLocaleDateString()
                            : new Date(
                                selectedOrder?.createdAt
                              ).toLocaleDateString()}
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
                          {selectedOrder?.paymentStatus || "N/A"}
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

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Order Summary
                      </h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Product</th>
                            <th className="p-2 text-center">Quantity</th>
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
                                <td className="p-2 text-right">
                                  {selectedOrder?.currency || currency}{" "}
                                  {(item.price || 0).toFixed(2)}
                                </td>
                                <td className="p-2 text-right">
                                  {selectedOrder?.currency || currency}{" "}
                                  {(
                                    item.totalPrice ||
                                    item.price * item.quantity ||
                                    0
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td colSpan="3" className="p-2 text-right">
                              Total:
                            </td>
                            <td className="p-2 text-right">
                              {selectedOrder?.currency || currency}{" "}
                              {selectedOrder?.totalAmount?.toFixed(2) || "0.00"}
                            </td>
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
                        {selectedOrder?.status === "Pending" && (
                          <button
                            onClick={() => {
                              handleCancelOrder(selectedOrder._id);
                              closeModal();
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                          >
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

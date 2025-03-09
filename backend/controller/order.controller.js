const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");
const Product = require("../model/productmodel");
const Cart = require("../model/cart.model");
const CartItem = require("../model/cartitem.model");
const axios = require("axios");
const mongoose = require("mongoose");
const { generateAccessToken, PAYPAL_API } = require("../utils/paypal");

exports.createOrder = async (req, res) => {
  try {
      console.log("📌 Creating order - Token User ID:", req.user?._id);

      const { productId, quantity, address, location, paymentMethod } = req.body;
      
      
      // Ensure user is logged in
      if (!req.user || !req.user._id) {
          return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      const userId = req.user._id.toString(); // ✅ Convert ObjectId to string

      // Find the product
      const product = await Product.findById(productId);
      if (!product || product.totalQuantity < quantity) {
          return res.status(400).json({ error: "Product not available or insufficient stock" });
      }

      const totalAmount = quantity * product.price;

      // Create Order Item
      const orderItem = new OrderItem({
          orderId: null, // Set after order creation
          productId,
          quantity,
          price: product.price,
          totalPrice: totalAmount
      });
      await orderItem.save();

      // Create Order
      const order = new Order({
          userId,  // ✅ User ID comes from `req.user._id`, not body
          orderItems: [orderItem._id], // ✅ Store order item reference
          totalAmount,
          address,
          location,
          paymentMethod,
          status: "Pending",
          paymentStatus: paymentMethod === "PayPal" ? "Pending" : "Paid"
      });

      await order.save();

      // Update OrderItem with the correct Order ID
      await OrderItem.findByIdAndUpdate(orderItem._id, { orderId: order._id });

      // Handle PayPal Payment
      if (paymentMethod === "PayPal") {
          try {
              const accessToken = await generateAccessToken();

              // Create PayPal Payment
              const paymentData = {
                  intent: "sale",
                  payer: { payment_method: "paypal" },
                  redirect_urls: {
                      return_url: `http://localhost:3001/v1/paypal/success?orderId=${order._id}`,
                      cancel_url: "http://localhost:3001/v1/paypal/cancel"
                  },
                  transactions: [{ amount: { currency: "USD", total: totalAmount.toFixed(2) } }]
              };

              // Call PayPal API
              const response = await axios.post(
                  `${PAYPAL_API}/v1/payments/payment`,
                  paymentData,
                  {
                      headers: {
                          Authorization: `Bearer ${accessToken}`,
                          "Content-Type": "application/json"
                      }
                  }
              );

              // Extract approval URL
              const approvalUrl = response.data.links.find(link => link.rel === "approval_url").href;

              return res.json({ message: "Redirect to PayPal", approvalUrl });

          } catch (paypalError) {
              console.error("❌ PayPal Payment Error:", paypalError.response?.data || paypalError.message);
              return res.status(500).json({ error: "PayPal payment initialization failed" });
          }
      }

      // Reduce product stock for COD payments
      product.totalQuantity -= quantity;
      product.totalSold += quantity;
      await product.save();

      return res.status(201).json({ message: "✅ Order placed successfully", order });

  } catch (error) {
      console.error("❌ Order Creation Error:", error);
      return res.status(500).json({ error: "Order creation failed" });
  }
};



// Assuming you have the Cart model and the function to remove items from it


exports.paypalSuccess = async (req, res) => {
  try {
    const { orderId, paymentId, PayerID, userId, productIds } = req.query;

    console.log(`✅ PayPal Success - Order ID: ${orderId}`);

    

    // Generate PayPal Access Token
    const accessToken = await generateAccessToken();
    if (!accessToken) {
      console.error("❌ Failed to generate PayPal access token");
      return res.status(500).json({ error: "Failed to generate PayPal access token" });
    }

    // Execute the PayPal payment
    const executePaymentUrl = `${PAYPAL_API}/v1/payments/payment/${paymentId}/execute`;
    const executePaymentData = { payer_id: PayerID };

    const paymentResponse = await axios.post(executePaymentUrl, executePaymentData, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    console.log("✅ PayPal Payment Executed:", JSON.stringify(paymentResponse.data, null, 2));

    if (paymentResponse.data.state !== "approved") {
      console.error("❌ PayPal Payment not approved");
      return res.status(400).json({ error: "Payment not approved by PayPal" });
    }

    // Update the order status to "Paid"
    const order = await Order.findById(orderId);
    if (!order) {
      console.error("❌ Order not found");
      return res.status(400).json({ error: "Order not found" });
    }

    order.paymentStatus = "Paid";
    await order.save();

    console.log(`✅ Order Status Updated: ${orderId} - Paid and Confirmed`);

    // Remove the items from the cart
    const cart = await Cart.findOne({ userId }).populate("cartItems");
    if (cart) {
      const productIdList = productIds.split(',');
      const cartItemIdsToRemove = cart.cartItems
        .filter(item => productIdList.includes(item.productId.toString()))
        .map(item => item._id);

      await CartItem.deleteMany({ _id: { $in: cartItemIdsToRemove } });
      console.log(`✅ Cart items cleared for order ID: ${orderId}`);
    }

    return res.json({ message: "Payment successful", order  });

  } catch (error) {
    console.error("❌ PayPal Success Error:", error);
    return res.status(500).json({ error: "Payment confirmation failed" });
  }
};





exports.cancelOrder = async (req, res) => {
  try {
      const { orderId } = req.params;

      // Fetch the order
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });

      // Ensure the order can only be cancelled if it's pending
      if (order.status !== "Pending") {
          return res.status(400).json({ error: "Order can only be cancelled if it's pending" });
      }

      // Restore product stock
      const orderItems = await OrderItem.find({ orderId });
      const bulkUpdates = orderItems.map(item => ({
          updateOne: {
              filter: { _id: item.productId },
              update: { 
                  $inc: { totalQuantity: item.quantity, totalSold: -item.quantity } 
              }
          }
      }));

      if (bulkUpdates.length) await Product.bulkWrite(bulkUpdates);

      // Update order status to "Cancelled"
      order.status = "Cancelled";
      await order.save();

      return res.status(200).json({ message: "✅ Order cancelled successfully", order });

  } catch (error) {
      console.error("❌ Order Cancellation Error:", error);
      return res.status(500).json({ error: "Something went wrong, please try again" });
  }
};

// Get All Orders for Logged-in User

exports.getOrders = async (req, res) => {
  try {
    console.log("🔵 Incoming request for orders...");

    if (!req.user || !req.user._id) {
      console.log("❌ Unauthorized: No valid user");
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Ensure userId is a valid ObjectId
    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log("🟢 Fetching orders for user:", userId);

    // Try fetching orders again
    const orders = await Order.find({ userId: userId })
      .populate({
        path: "orderItems",
        populate: { path: "productId", select: "name price" },
      })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      console.log("⚠️ No orders found for user:", userId);
      return res.status(404).json({ message: "No orders found" });
    }

    console.log("✅ Orders retrieved:", orders.length);
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Get Orders Error:", error);
    return res.status(500).json({
      error: "Failed to retrieve orders",
      details: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
      console.log("📌 Fetching all orders...");

      const orders = await Order.find()
          .populate({
              path: "userId",
              select: "name email" // Fetch user details
          })
          .populate({
              path: "orderItems",
              populate: {
                  path: "productId",
                  select: "name price" // Fetch product details
              }
          })
          .sort({ createdAt: -1 }); // Sort orders by latest

      return res.status(200).json({ message: "✅ Orders fetched successfully", orders });

  } catch (error) {
      console.error("❌ Error fetching orders:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
  }
};


exports.changeOrderStatus = async (req, res) => {
  try {
      const { orderId } = req.params;
      const { status } = req.body;

      // Allowed status updates
      const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

      if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: "Invalid status update" });
      }

      // Fetch the order
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });

      

      // Prevent changing status of cancelled orders
      if (order.status === "Cancelled") {
          return res.status(400).json({ error: "Cannot update a cancelled order" });
      }

      // Update the order status
      order.status = status;
      await order.save();

      return res.status(200).json({ message: `✅ Order status updated to ${status}`, order });

  } catch (error) {
      console.error("❌ Order Status Update Error:", error);
      return res.status(500).json({ error: "Something went wrong, please try again" });
  }
};

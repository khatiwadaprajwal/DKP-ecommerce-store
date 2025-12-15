const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");
const Product = require("../model/productmodel");
const axios = require("axios");
const Cart = require("../model/cart.model");
const CartItem = require("../model/cartitem.model");
const User = require("../model/usermodel");
const { generateAccessToken, PAYPAL_API } = require("../utils/paypal");
const { sendOrderEmail } = require("../utils/mailer");
const mongoose = require("mongoose");


const EXCHANGE_RATE_NPR_TO_USD = 135;

exports.createOrder = async (req, res) => {
  try {
    console.log("📌 Creating order - Token User ID:", req.user?._id);

    const { productId, quantity, address, location, paymentMethod, color, size } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const userId = req.user._id.toString();

    // Validate product and check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    const variantIndex = product.variants.findIndex(v => v.color === color && v.size === size);
    if (variantIndex === -1) {
      return res.status(400).json({ error: "Selected variant is out of stock or insufficient" });
    }

    const variant = product.variants[variantIndex];
    if (variant.quantity < quantity) {
      return res.status(400).json({
        error: `Insufficient stock for ${product.productName} (${color} - ${size}). Available stock: ${variant.quantity}`
      });
    }

    const totalAmount = quantity * product.price;

    // 🟢 CHANGED LOGIC HERE:
    // Set Khalti/PayPal orders to "Failed" initially.
    // They will only become "Pending" (Confirmed) if the payment callback succeeds.
    const initialStatus = (paymentMethod === "Khalti" || paymentMethod === "PayPal") ? "Failed" : "Pending";

    // Create order with initial status
    const order = new Order({
      userId,
      orderItems: [],
      totalAmount,
      address,
      location,
      paymentMethod,
      status: initialStatus,        // ✅ Starts as Failed
      paymentStatus: initialStatus, // ✅ Starts as Failed
      currency: "NPR"
    });

    await order.save();

    // Create order item
    const orderItem = new OrderItem({
      orderId: order._id,
      productId,
      quantity,
      price: product.price,
      totalPrice: totalAmount,
      color,
      size
    });

    await orderItem.save();
    order.orderItems.push(orderItem._id);
    await order.save();

    // If payment method is Cash, update stock quantities immediately
    if (paymentMethod === "Cash") {
      product.variants[variantIndex].quantity -= quantity;
      product.totalQuantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);
      product.totalSold += quantity;
      await product.save();
    }

    // If payment method is Khalti
    if (paymentMethod === "Khalti") {
      try {
        const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
        const amountInPaisa = totalAmount * 100; // Khalti requires paisa

        const paymentData = {
          return_url: `https://dkp-ecommerce-store-backend.onrender.com/v1/payments/complete-khalti-payment?orderId=${order._id}&userId=${userId}`,
          website_url: `https://dkp-ecommerce-store-frontend.onrender.com`,
          amount: amountInPaisa,
          purchase_order_id: order._id.toString(),
          purchase_order_name: `Order Payment`,
          customer_info: {
            name: req.user.fullName || "Customer",
            email: req.user.email
          }
        };

        const headers = {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        };

        const khaltiResponse = await axios.post(
          `https://a.khalti.com/api/v2/epayment/initiate/`,
          paymentData,
          { headers }
        );

        const khaltiUrl = khaltiResponse.data.payment_url;

        return res.status(200).json({
          message: "Redirect to Khalti",
          khaltiUrl
        });
      } catch (khaltiError) {
        console.error("❌ Khalti Payment Error:", khaltiError.response?.data || khaltiError.message);
        return res.status(500).json({ error: "Khalti payment initialization failed" });
      }
    }

    // If payment method is PayPal
    if (paymentMethod === "PayPal") {
      try {
        const accessToken = await generateAccessToken();
        const usdAmount = Number((totalAmount / EXCHANGE_RATE_NPR_TO_USD).toFixed(2)).toString();

        const paymentData = {
          intent: "sale",
          payer: { payment_method: "paypal" },
          redirect_urls: {
            return_url: `https://dkp-ecommerce-store-frontend.onrender.com/paypal/success?orderId=${order._id}&userId=${userId}&productIds=${selectedProducts.map(p => p.productId).join(',')}`,
            cancel_url: 'https://dkp-ecommerce-store-backend.onrender.com/v1/paypal/cancel'
          },
          transactions: [
            {
              amount: {
                currency: "USD",
                total: usdAmount
              },
              description: `Payment for ${quantity} x ${product.productName}`
            }
          ]
        };

        const response = await axios.post(`${PAYPAL_API}/v1/payments/payment`, paymentData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        const approvalUrl = response.data.links.find(link => link.rel === "approval_url").href;
        return res.json({ message: "Redirect to PayPal", approvalUrl });

      } catch (paypalError) {
        console.error("❌ PayPal Payment Error:", paypalError.response?.data || paypalError.message);
        return res.status(500).json({ error: "PayPal payment initialization failed" });
      }
    }

    // ✅ Send order confirmation email
    await sendOrderEmail(req.user.email, {
      _id: order._id,
      productDetails: [{
        productName: product.productName,
        color,
        size,
        quantity,
        price: product.price,
        totalPrice: totalAmount
      }],
      totalAmount,
      address,
      paymentMethod,
      status: order.status
    });

    return res.status(201).json({
      message: "✅ Order placed successfully",
      order
    });

  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    return res.status(500).json({ error: "Order creation failed" });
  }
};
exports.completeKhaltiPayment = async (req, res) => {
  const { pidx, orderId, userId, status, message } = req.query;

  try {
    // 1. Handle Cancellation/Failure from Khalti
    if (status === "UserCanceled" || status === "Expired" || message === "User canceled" || !pidx) {
      console.log(`⚠️ Payment Cancelled for Order: ${orderId}`);
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "Failed", status: "Failed" });
      return res.redirect(`https://dkp-ecommerce-store-frontend.onrender.com/payment-failed?orderId=${orderId}`);
    }

    // 2. Fetch Order and Check if Already Paid (Prevent Double Stock Deduction)
    // We populate orderItems to get access to productId, color, size, and quantity
    const order = await Order.findById(orderId).populate("orderItems");
    
    if (!order) {
        return res.status(404).send("Order not found");
    }

    if (order.paymentStatus === "Paid") {
        console.log("ℹ️ Order already processed");
        return res.redirect(`https://dkp-ecommerce-store-frontend.onrender.com/payment-success?orderId=${orderId}`);
    }

    // 3. Verify Payment with Khalti API
    const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
    const headers = {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.post(
      `https://a.khalti.com/api/v2/epayment/lookup/`,
      { pidx },
      { headers }
    );

    if (response.data.status !== "Completed") {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "Failed", status: "Failed" });
      return res.redirect(`https://dkp-ecommerce-store-frontend.onrender.com/payment-failed?orderId=${orderId}`);
    }

    // 4. Mark Order as Paid
    order.paymentStatus = "Paid";
    order.status = "Pending";
    order.transactionId = pidx;
    await order.save();

    // =========================================================
    // 🟢 STOCK DEDUCTION LOGIC (Crucial for Cart Orders)
    // =========================================================
    for (const item of order.orderItems) {
      const product = await Product.findById(item.productId);
      
      if (product) {
        // Find the specific variant (Color/Size)
        const variantIndex = product.variants.findIndex(
          (v) => v.color === item.color && v.size === item.size
        );

        if (variantIndex !== -1) {
          // Deduct quantity
          product.variants[variantIndex].quantity -= item.quantity;
          
          // Safety check: ensure quantity doesn't go below 0
          if (product.variants[variantIndex].quantity < 0) {
             product.variants[variantIndex].quantity = 0;
          }

          // Recalculate total quantity for the product
          product.totalQuantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);
          product.totalSold += item.quantity;

          await product.save();
          console.log(`✅ Stock updated for ${product.productName}`);
        }
      }
    }

    // =========================================================
    // 🟢 CLEAR CART LOGIC
    // =========================================================
    const cart = await Cart.findOne({ userId });
    if (cart) {
      const orderedProductIds = order.orderItems.map(item => item.productId);
      
      await CartItem.deleteMany({ 
        cartId: cart._id, 
        productId: { $in: orderedProductIds }
      });
      console.log("✅ Cart items cleared successfully");
    }

    // 5. Redirect to Success Page
    return res.redirect(`https://dkp-ecommerce-store-frontend.onrender.com/payment-success?orderId=${orderId}`);

  } catch (error) {
    console.error("❌ Error verifying Khalti payment:", error.message);
    if (orderId) {
       await Order.findByIdAndUpdate(orderId, { paymentStatus: "Failed", status: "Failed" });
       return res.redirect(`https://dkp-ecommerce-store-frontend.onrender.com/payment-failed?orderId=${orderId}`);
    }
    return res.status(500).send("Payment verification failed");
  }
};

exports.paypalSuccess = async (req, res) => {
  try {
    const { orderId, paymentId, PayerID, userId, productIds } = req.query;

    if (!orderId || !paymentId || !PayerID || !userId || !productIds) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    console.log(`✅ Processing PayPal payment for Order ID: ${orderId}`);

    // 1. Generate PayPal access token
    const accessToken = await generateAccessToken();
    if (!accessToken) {
      console.error("❌ Failed to generate PayPal access token");
      return res.status(500).json({ error: "Failed to generate PayPal access token" });
    }

    // 2. Execute PayPal payment
    const executePaymentUrl = `${PAYPAL_API}/v1/payments/payment/${paymentId}/execute`;
    const executePaymentData = { payer_id: PayerID };

    const paymentResponse = await axios.post(executePaymentUrl, executePaymentData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ PayPal Payment Response:", JSON.stringify(paymentResponse.data, null, 2));

    // 3. Verify payment status
    if (paymentResponse.data.state !== "approved") {
      console.error("❌ Payment not approved by PayPal");
      return res.status(400).json({ error: "Payment not approved by PayPal" });
    }

    // 4. Find and update order
    const order = await Order.findById(orderId).populate("orderItems");
    if (!order) {
      console.error("❌ Order not found:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId.toString() !== userId) {
      console.error("❌ Order user ID mismatch");
      return res.status(403).json({ error: "Unauthorized access to order" });
    }

    if (order.paymentStatus === "Paid") {
      console.log("ℹ️ Order already marked as paid");
      return res.json({ message: "Payment already processed", order });
    }

    // 5. Update order status
    // 🟢 FIX: Changed "processing" to "Processing" (Capital P)
    order.status = "Pending"; 
    order.paymentStatus = "Paid";
    // Optional: Save transaction details
    order.paymentId = paymentId; 
    
    await order.save();
    console.log("✅ Order marked as paid");

    // 6. Update product quantities in parallel
    await Promise.all(order.orderItems.map(async (orderItem) => {
      const product = await Product.findById(orderItem.productId);
      if (!product) {
        console.warn(`⚠️ Product not found for order item: ${orderItem._id}`);
        return;
      }

      const variantIndex = product.variants.findIndex(
        v => v.color === orderItem.color && v.size === orderItem.size
      );

      if (variantIndex === -1) {
        console.warn(`⚠️ Variant not found for product: ${product._id}`);
        return;
      }

      // Prevent negative quantity
      if (product.variants[variantIndex].quantity < orderItem.quantity) {
        console.warn(`⚠️ Insufficient stock for ${product._id}`);
        return;
      }

      product.variants[variantIndex].quantity -= orderItem.quantity;
      product.totalQuantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);
      product.totalSold += orderItem.quantity;
      await product.save();
      console.log(`✅ Updated quantity for product: ${product._id}`);
    }));

    // 7. Clear cart items
    const cart = await Cart.findOne({ userId });
    if (cart) {
      const productIdList = typeof productIds === "string" ? productIds.split(",") : [];
      await CartItem.deleteMany({ 
        cartId: cart._id, 
        productId: { $in: productIdList }
      });
      console.log("✅ Cart items cleared");
    }

    // 8. Send confirmation email
    try {
      const populatedOrder = await Order.findById(orderId)
        .populate({
          path: "orderItems",
          populate: {
            path: "productId",
            select: "productName price"
          }
        });

      const user = await User.findById(userId);
      const email = user?.email || null;

      if (email) {
        const emailData = {
          _id: order._id,
          productDetails: populatedOrder.orderItems.map(item => ({
            productName: item.productId?.productName || "Product",
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice
          })),
          totalAmount: order.totalAmount,
          address: order.address,
          paymentMethod: order.paymentMethod,
          status: order.status
        };

        await sendOrderEmail(email, emailData);
        console.log("✅ Order confirmation email sent");
      }
    } catch (emailError) {
      console.error("⚠️ Error sending confirmation email:", emailError);
    }

    return res.json({ 
      success: true,
      message: "Payment processed successfully", 
      order 
    });
  } catch (error) {
    console.error("❌ PayPal Success Error:", error);
    return res.status(500).json({ 
      error: "Payment confirmation failed",
      details: error.message 
    });
  }
};



exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      console.log("❌ Order not found for ID:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "Pending") {
      console.log("⚠️ Order is not pending. Current status:", order.status);
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    const orderItems = await OrderItem.find({ orderId });

    console.log(`📦 Found ${orderItems.length} order items for cancellation.`);

    for (const item of orderItems) {
      console.log(`🔄 Processing OrderItem: ${item._id}`);

      const product = await Product.findById(item.productId);
      if (!product) {
        console.warn(`❗ Product not found for ID: ${item.productId}`);
        continue;
      }

      const color = item.color?.toLowerCase?.();
      const size = item.size?.toLowerCase?.();
      const quantity = Number(item.quantity);

      console.log(`🧩 Looking for variant (color: ${color}, size: ${size}, quantity: ${quantity})`);

      const variantIndex = product.variants.findIndex(
        (variant) =>
          variant.color?.toLowerCase?.() === color &&
          variant.size?.toLowerCase?.() === size
      );

      if (variantIndex === -1) {
        console.warn("⚠️ Variant not matched! Skipping update.");
        continue;
      }

      const variant = product.variants[variantIndex];

      console.log("✅ Before Update - Variant Quantity:", variant.quantity);

      // 👉 Increase back variant quantity
      product.variants[variantIndex].quantity += quantity;
      product.markModified("variants");

      console.log("✅ After Update - Variant Quantity:", product.variants[variantIndex].quantity);

      // 👉 Adjust totalQuantity and totalSold
      product.totalQuantity += quantity;
      product.totalSold -= quantity;

      console.log("🔢 Product totalQuantity:", product.totalQuantity);
      console.log("🔢 Product totalSold:", product.totalSold);

      const saveResult = await product.save();
      console.log("💾 Product save result:", saveResult ? "Saved" : "Not saved");
    }

    // ✅ Update order status
    order.status = "Cancelled";
    await order.save();
    console.log("✅ Order status updated to Cancelled");

    return res.status(200).json({
      message: "✅ Order cancelled successfully",
      order,
    });
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
        populate: { path: "productId", select: "productName price images" },
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
        select: "name email", // Fetch user details
      })
      .populate({
        path: "orderItems",
        populate: {
          path: "productId",
          select: "_id productName price images ", // Fetch product details
        },
      })
      .sort({ createdAt: -1 }); // Sort orders by latest

    return res
      .status(200)
      .json({ message: "✅ Orders fetched successfully", orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};



exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status update" });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "userId",
        select: "name email",
      })
      .populate({
        path: "orderItems",
        populate: {
          path: "productId",
          select: "_id productName price images",
        },
      });

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status === "Cancelled") {
      return res
        .status(400)
        .json({ error: "Cannot update a cancelled order" });
    }

    order.status = status;
    await order.save();

    // Send Email to user about status change
    await sendOrderStatusUpdateEmail(order.userId.email, order);

    return res
      .status(200)
      .json({ message: `✅ Order status updated to ${status}`, order });
  } catch (error) {
    console.error("❌ Order Status Update Error:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong, please try again" });
  }
};
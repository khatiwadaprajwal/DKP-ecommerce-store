require('dotenv').config();
const Cart = require("../model/cart.model");
const CartItem = require("../model/cartitem.model");
const Product = require("../model/productmodel");
const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");
const mongoose = require("mongoose");
const axios = require("axios");
const { generateAccessToken, PAYPAL_API } = require("../utils/paypal");

// ✅ Extract User ID
const extractUserId = (req) => {
  if (!req.user || !req.user._id) throw new Error("User ID not found in request");
  return req.user._id;
};

// ✅ Add to Cart (No Quantity)
exports.addToCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { productId } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, cartItems: [] });
      await cart.save();
    }

    const existingCartItem = await CartItem.findOne({ cartId: cart._id, productId });
    if (!existingCartItem) {
      const cartItem = new CartItem({ cartId: cart._id, productId, quantity: 1 });
      await cartItem.save();
      cart.cartItems.push(cartItem._id);
      await cart.save();
    }

    res.status(201).json({ msg: "Product added to cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ✅ Remove Product from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    const cartItem = await CartItem.findOneAndDelete({ cartId: cart._id, productId });
    if (cartItem) {
      cart.cartItems.pull(cartItem._id);
      await cart.save();
    }

    res.status(200).json({ msg: "Product removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ✅ Get Cart with Items
exports.getCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const cart = await Cart.findOne({ userId }).populate({
      path: "cartItems",
      populate: { path: "productId", select: "name price totalQuantity" },
    });

    if (!cart || cart.cartItems.length === 0) {
      return res.status(404).json({ msg: "Cart is empty" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

 // Required for PayPal integration

exports.placeOrderFromCart = async (req, res) => {
  try {
    console.log("🛒 Placing order from cart...");

    const userId = req.user._id;
    const { selectedProducts, address, location, paymentMethod } = req.body;

    // Ensure selectedProducts is an array
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      return res.status(400).json({ error: "No products selected for order" });
    }

    // Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate("cartItems");
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (let item of selectedProducts) {
      const { productId, quantity } = item;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${productId} not found` });
      }

      if (product.totalQuantity < quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      // Create OrderItem
      const orderItem = new OrderItem({
        orderId: null, // Will be assigned after order creation
        productId: productId,
        quantity: quantity,
        price: product.price,
        totalPrice: quantity * product.price,
      });

      await orderItem.save();
      orderItems.push(orderItem._id);
      totalAmount += orderItem.totalPrice;
    }

    // Create Order
    const order = new Order({
      userId,
      orderItems,
      totalAmount,
      address,
      location,
      paymentMethod,
      status: "Pending",
      paymentStatus: paymentMethod === "PayPal" ? "Pending" : "Paid",
    });

    await order.save();

    // Update OrderItem with orderId
    await OrderItem.updateMany({ _id: { $in: orderItems } }, { orderId: order._id });

    // Handle PayPal payment
    if (paymentMethod === "PayPal") {
      try {
        const accessToken = await generateAccessToken();
        const paymentData = {
          intent: "sale",
          payer: { payment_method: "paypal" },
          redirect_urls: {
            return_url: `http://localhost:3001/v1/paypal/success?orderId=${order._id}`,
            cancel_url: "http://localhost:3001/v1/paypal/cancel",
          },
          transactions: [{ amount: { currency: "USD", total: totalAmount.toFixed(2) } }],
        };

        const response = await axios.post(`${PAYPAL_API}/v1/payments/payment`, paymentData, {
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        });

        const approvalUrl = response.data.links.find(link => link.rel === "approval_url").href;
        return res.json({ message: "Redirect to PayPal", approvalUrl });

      } catch (paypalError) {
        console.error("❌ PayPal Payment Error:", paypalError.response?.data || paypalError.message);
        return res.status(500).json({ error: "PayPal payment initialization failed" });
      }
    }

    // Deduct stock after order placement
    for (let item of selectedProducts) {
      const product = await Product.findById(item.productId);
      product.totalQuantity -= item.quantity;
      product.totalSold += item.quantity;
      await product.save();
    }

    // Remove ordered items from cart
    await CartItem.deleteMany({ cartId: cart._id, productId: { $in: selectedProducts.map(p => p.productId) } });

    return res.status(201).json({ message: "✅ Order placed successfully", order });

  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    return res.status(500).json({ error: "Order placement failed" });
  }
};


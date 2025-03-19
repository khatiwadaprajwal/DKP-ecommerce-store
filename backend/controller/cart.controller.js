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
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // Find and delete the cart item
    const cartItem = await CartItem.findOneAndDelete({ 
      cartId: cart._id, 
      productId 
    });

    if (!cartItem) {
      return res.status(404).json({ msg: "Item not found in cart" });
    }

    // Remove the reference from the cart
    cart.cartItems.pull(cartItem._id);
    await cart.save();

    res.status(200).json({ msg: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// ✅ Get Cart with Items
exports.getCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const cart = await Cart.findOne({ userId }).populate({
      path: "cartItems",
      populate: { path: "productId", select: "productName price images totalQuantity" },
    });

    if (!cart || cart.cartItems.length === 0) {
      return res.status(200).json({ cart: { cartItems: [] } });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};


exports.placeOrderFromCart = async (req, res) => {
  try {
    console.log("🛒 Placing order from cart...");

    const userId = req.user._id;
    const { selectedProducts, address, location, paymentMethod } = req.body;

    // Ensure selectedProducts is an array
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      return res.status(400).json({ error: "No products selected for order" });
    }

    // Fetch user's cart with populated cartItems
    const cart = await Cart.findOne({ userId }).populate("cartItems");

    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    console.log("📦 Cart Items Before Processing:", cart.cartItems);

    let orderItems = [];
    let totalAmount = 0;

    for (let item of selectedProducts) {
      const { productId, quantity } = item;
      console.log(`🔎 Processing Product ID: ${productId} (Quantity: ${quantity})`);

      const product = await Product.findById(productId);
      if (!product) {
        console.log(`❌ Product with ID ${productId} not found.`);
        return res.status(400).json({ error: `Product with ID ${productId} not found` });
      }

      if (product.totalQuantity < quantity) {
        console.log(`⚠️ Insufficient stock for ${product.name}`);
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

    // Update OrderItem with orderId after order creation
    await OrderItem.updateMany({ _id: { $in: orderItems } }, { orderId: order._id });

    // PayPal Payment Processing
    if (paymentMethod === "PayPal") {
      const accessToken = await generateAccessToken();
      const paymentData = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
          return_url: `http://localhost:3001/v1/paypal/success?orderId=${order._id}&userId=${userId}&productIds=${selectedProducts.map(p => p.productId).join(',')}`,
          cancel_url: "http://localhost:3001/v1/paypal/cancel",
        },
        transactions: [{ amount: { currency: "USD", total: totalAmount.toFixed(2) } }],
      };

      const response = await axios.post(`${PAYPAL_API}/v1/payments/payment`, paymentData, {
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      });

      const approvalUrl = response.data.links.find(link => link.rel === "approval_url").href;
      return res.json({ message: "Redirect to PayPal", approvalUrl });
    }

    // Deduct stock after order placement
    for (let item of selectedProducts) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.totalQuantity -= item.quantity;
        product.totalSold += item.quantity;
        await product.save();
      }
    }

    // Remove ordered items from cart
    const orderedProductIds = selectedProducts.map(p => p.productId);
    await CartItem.deleteMany({ cartId: cart._id, productId: { $in: orderedProductIds } });

    return res.json({ message: "Order placed successfully", order });

  } catch (error) {
    console.error("❌ Order Placement Error:", error);
    return res.status(500).json({ error: "Order placement failed, please try again" });
  }
};







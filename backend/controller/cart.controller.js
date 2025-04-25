require('dotenv').config();
const Cart = require("../model/cart.model");
const CartItem = require("../model/cartitem.model");
const Product = require("../model/productmodel");
const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");
const mongoose = require("mongoose");
const axios = require("axios");
const { generateAccessToken, PAYPAL_API } = require("../utils/paypal");

const EXCHANGE_RATE_NPR_TO_USD = 135; 

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

// ✅ Update Cart Item Quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const cartItem = await CartItem.findOne({ 
      cartId: cart._id, 
      productId 
    });

    if (!cartItem) {
      return res.status(404).json({ msg: "Cart item not found" });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ msg: "Cart updated successfully", cartItem });
  } catch (error) {
    console.error("Error updating cart:", error);
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

    // Check if there are selected products
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      return res.status(400).json({ error: "No products selected for order" });
    }

    // Fetch the cart for the user
    const cart = await Cart.findOne({ userId }).populate("cartItems");
    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    console.log("📦 Cart Items Before Processing:", cart.cartItems);

    let orderItems = [];
    let totalAmount = 0;

    // Loop through each selected product to process the order
    for (let item of selectedProducts) {
      const { productId, quantity, color, size } = item;
      console.log(`🔎 Processing Product ID: ${productId} (Quantity: ${quantity}, Color: ${color}, Size: ${size})`);

      // Fetch the product details from the database
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${productId} not found` });
      }

      // Find the variant based on color and size
      const variantIndex = product.variants.findIndex(
        (v) => v.color === color && v.size === size
      );

      if (variantIndex === -1) {
        return res.status(400).json({ error: `Variant not found for product ${product.productName} (Color: ${color}, Size: ${size})` });
      }

      const variant = product.variants[variantIndex];

      // Log the available stock for this variant
      console.log(`Available stock for ${product.productName} (${color} - ${size}): ${variant.quantity}`);

      // Check if the quantity requested is available in stock
      if (variant.quantity < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.productName} (${color} - ${size}). Available stock: ${variant.quantity}`,
        });
      }

      // Decrease the stock quantity of the variant
      product.variants[variantIndex].quantity -= quantity;

      // Update the totalQuantity and totalSold for the product
      product.totalQuantity = product.variants.reduce((sum, v) => sum + v.quantity, 0);
      product.totalSold += quantity;

      // Save the updated product details
      await product.save();

      // Create an order item for this product (with orderId placeholder for now)
      const orderItem = new OrderItem({
        productId: productId,
        quantity: quantity,
        price: product.price,
        totalPrice: quantity * product.price,
        color,
        size,
        orderId: null // Set to null temporarily
      });

      // Save the order item (but it doesn't have a valid orderId yet)
      await orderItem.save();
      orderItems.push(orderItem._id);
      totalAmount += orderItem.totalPrice;
    }

    // Create the new order after processing all items
    const order = new Order({
      userId,
      orderItems,
      totalAmount,
      address,
      location,
      paymentMethod,
      status: "Pending",
      paymentStatus: paymentMethod === "PayPal" ? "Paid" : "Pending",
      currency: "NPR"
    });

    // Save the new order
    await order.save();

    // Now that the order is saved, update the orderId for each order item
    await OrderItem.updateMany(
      { _id: { $in: orderItems } },
      { $set: { orderId: order._id } }
    );

    // Handle PayPal payment (if chosen)
    if (paymentMethod === "PayPal") {
      try {
        const accessToken = await generateAccessToken();
        const usdAmount = Number((totalAmount / EXCHANGE_RATE_NPR_TO_USD).toFixed(2)).toString();

        const paymentData = {
          intent: "sale",
          payer: { payment_method: "paypal" },
          redirect_urls: {
            return_url: `http://localhost:3001/v1/paypal/success?orderId=${order._id}&userId=${userId}&productIds=${selectedProducts.map(p => p.productId).join(',')}`,
            cancel_url: "http://localhost:3001/v1/paypal/cancel"
          },
          transactions: [
            {
              amount: {
                currency: "USD",
                total: usdAmount
              },
              description: "Payment for cart items"
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

    // Remove the ordered items from the cart
    const orderedProductIds = selectedProducts.map(p => p.productId);
    await CartItem.deleteMany({ cartId: cart._id, productId: { $in: orderedProductIds } });

    // Return success response
    return res.json({ message: "Order placed successfully", order });

  } catch (error) {
    console.error("❌ Order Placement Error:", error);
    return res.status(500).json({ error: "Order placement failed, please try again" });
  }
};

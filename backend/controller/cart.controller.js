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
    const { productId, quantity = 1, color, size } = req.body;
    
    // Validate required fields
    if (!productId || !color || !size) {
      return res.status(400).json({
        msg: "Product ID, color, and size are required"
      });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    // Find or create user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, cartItems: [] });
      await cart.save();
    }
    
    // Check if this product variant is already in cart
    const existingCartItem = await CartItem.findOne({
      cartId: cart._id,
      productId,
      color,
      size
    });
    
    if (existingCartItem) {
      // Update quantity if item already exists
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      // Create new cart item
      const cartItem = new CartItem({
        cartId: cart._id,
        productId,
        quantity,
        color,
        size
      });
      
      await cartItem.save();
      cart.cartItems.push(cartItem._id);
      await cart.save();
    }
    
    // Return populated cart data with all fields including color, size and quantity
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'cartItems',
        // Keep all the CartItem fields when populating
        select: 'productId quantity color size',
        populate: {
          path: 'productId',
          model: 'Product'
        }
      });
    
    // Format the response data to include all necessary information
    const formattedCart = {
      _id: populatedCart._id,
      userId: populatedCart.userId,
      cartItems: populatedCart.cartItems.map(item => ({
        _id: item._id,
        product: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }))
    };
    
    res.status(201).json({
      success: true,
      msg: "Product added to cart",
      cart: formattedCart
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
// ✅ Update Cart Item Quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { cartItemId, quantity } = req.body;

    // Validate input
    if (!cartItemId || !quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false,
        msg: "Cart item ID and valid quantity are required" 
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        msg: "Cart not found" 
      });
    }

    // Find the cart item by ID and ensure it belongs to the user's cart
    const cartItem = await CartItem.findOne({ 
      _id: cartItemId,
      cartId: cart._id
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false,
        msg: "Cart item not found" 
      });
    }

    // Check product stock availability
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        msg: "Product not found" 
      });
    }

    // Find the specific variant to check available quantity
    const variant = product.variants.find(
      v => v.color === cartItem.color && v.size === cartItem.size
    );

    if (!variant) {
      return res.status(404).json({ 
        success: false,
        msg: "Product variant not found" 
      });
    }

    // Check if requested quantity is available
    if (variant.quantity < quantity) {
      return res.status(400).json({ 
        success: false,
        msg: `Only ${variant.quantity} items available for this product variant` 
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    // Return the updated cart with populated items
    const updatedCart = await Cart.findOne({ userId })
      .populate({
        path: "cartItems",
        select: "productId quantity color size",
        populate: { 
          path: "productId", 
          select: "productName price images totalQuantity" 
        }
      });

    // Format the response to include all necessary information
    const formattedCart = {
      _id: updatedCart._id,
      userId: updatedCart.userId,
      cartItems: updatedCart.cartItems.map(item => ({
        _id: item._id,
        product: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }))
    };

    res.status(200).json({ 
      success: true,
      msg: "Cart updated successfully", 
      cart: formattedCart
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ 
      success: false,
      msg: "Internal server error" 
    });
  }
};

// ✅ Remove Product from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const { cartItemId } = req.params;

    // Validate input
    if (!cartItemId) {
      return res.status(400).json({ 
        success: false,
        msg: "Cart item ID is required" 
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        msg: "Cart not found" 
      });
    }

    // Find and delete the cart item, ensuring it belongs to this user's cart
    const cartItem = await CartItem.findOneAndDelete({ 
      _id: cartItemId,
      cartId: cart._id 
    });

    if (!cartItem) {
      return res.status(404).json({ 
        success: false,
        msg: "Item not found in cart" 
      });
    }

    // Remove the reference from the cart
    cart.cartItems.pull(cartItem._id);
    await cart.save();

    // Return the updated cart with populated items
    const updatedCart = await Cart.findOne({ userId })
      .populate({
        path: "cartItems",
        select: "productId quantity color size",
        populate: { 
          path: "productId", 
          select: "productName price images totalQuantity" 
        }
      });

    // Format the response to include all necessary information
    const formattedCart = {
      _id: updatedCart._id,
      userId: updatedCart.userId,
      cartItems: updatedCart.cartItems.map(item => ({
        _id: item._id,
        product: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }))
    };

    res.status(200).json({ 
      success: true,
      msg: "Item removed from cart",
      cart: formattedCart
    });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ 
      success: false,
      msg: "Internal server error" 
    });
  }
};

// ✅ Get Cart with Items
exports.getCart = async (req, res) => {
  try {
    const userId = extractUserId(req);
    
    // Find the cart and populate cart items with product details
    const cart = await Cart.findOne({ userId }).populate({
      path: "cartItems",
      // Explicitly select all fields from CartItem including color, size, quantity
      select: "productId quantity color size",
      populate: { 
        path: "productId", 
        select: "productName price images totalQuantity" 
      },
    });
    
    // Return empty cart if no cart found or cart is empty
    if (!cart || cart.cartItems.length === 0) {
      return res.status(200).json({ cart: { cartItems: [] } });
    }
    
    // Format the response to include all necessary information
    const formattedCart = {
      _id: cart._id,
      userId: cart.userId,
      cartItems: cart.cartItems.map(item => ({
        _id: item._id,
        product: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }))
    };
    
    res.status(200).json({ 
      success: true,
      cart: formattedCart 
    });
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
            return_url: `http://localhost:5173/paypal/success?orderId=${order._id}&userId=${userId}&productIds=${selectedProducts.map(p => p.productId).join(',')}`,
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

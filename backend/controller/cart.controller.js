require('dotenv').config();
const Cart = require("../model/cart.model");
const CartItem = require("../model/cartitem.model");
const Product = require("../model/productmodel");
const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");
const mongoose = require("mongoose");


const extractUserId = (req) => {
  if (!req.user || !req.user._id) throw new Error("User ID not found in request");
  return req.user._id;
};
exports.addToCart = async (req, res) => {
    try {
      const userId = extractUserId(req);
      const { productId, quantity } = req.body;
  
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId });
        await cart.save();
      }
  
      const cartItem = await CartItem.findOneAndUpdate(
        { cartId: cart._id, productId },
        { $inc: { quantity: quantity } },  // Increment the quantity
        { new: true, upsert: true }        // Return updated doc & create if not exists
      );
  
      res.status(201).json({ msg: "Product added to cart", cartItem });
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

    await CartItem.deleteOne({ cartId: cart._id, productId });

    res.status(200).json({ msg: "Product removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ userId });

        if (!cart) return res.status(404).json({ msg: "Cart is empty" });

        const cartItems = await CartItem.find({ cartId: cart._id }).populate({
            path: "productId",
            select: "name price totalQuantity"
        });

        res.status(200).json({ cart, cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};



 

 
  

  
  
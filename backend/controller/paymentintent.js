require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../model/cart.model");
const Product = require("../model/productmodel");
const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");




const createPaymentIntent = async (req, res) => {
  try {
    const { selectedProducts, address, location } = req.body;

    console.log("🔍 Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY ? "Yes" : "No");
    console.log("🛒 Payment Request Data:", req.body);

    if (!selectedProducts || selectedProducts.length === 0) {
      return res.status(400).json({ msg: "No products selected for payment" });
    }

    // Fetch product prices from DB
    let totalAmount = 0;
    for (const item of selectedProducts) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.productId}` });
      }

      // Calculate total price
      totalAmount += product.price * item.quantity;
    }

    // Ensure amount is valid (Stripe requires the smallest currency unit, e.g., cents)
    if (totalAmount <= 0) {
      return res.status(400).json({ msg: "Invalid total amount" });
    }

    // Convert amount to the smallest unit (e.g., cents for USD)
    const amountInCents = totalAmount * 100; 

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, 
      currency: "usd", 
      payment_method_types: ["card"],
    });

    res.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    res.status(500).json({ msg: error.message });
  }
};






const confirmPayment = async (req, res) => {
    try {
      const { paymentIntentId, selectedProducts } = req.body;
  
      console.log("🟢 Payment Intent ID:", paymentIntentId);
      console.log("🛒 Selected Products:", selectedProducts);
  
      if (!paymentIntentId) {
        return res.status(400).json({ msg: "Missing paymentIntentId" });
      }
  
      if (!selectedProducts || selectedProducts.length === 0) {
        return res.status(400).json({ msg: "No products selected" });
      }
  
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ msg: "Payment not completed" });
      }
  
      // Update product stock and sales
      for (const item of selectedProducts) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ msg: `Product not found: ${item.productId}` });
        }
  
        product.totalQuantity -= item.quantity;
        product.soldQuantity = (product.soldQuantity || 0) + item.quantity;
  
        await product.save();
      }
  
      res.json({ msg: "Payment confirmed, order placed" });
    } catch (error) {
      console.error("❌ Error in confirmPayment:", error);
      res.status(500).json({ msg: error.message });
    }
  };
  
 
  

module.exports = { createPaymentIntent,confirmPayment };

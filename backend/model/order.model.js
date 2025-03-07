const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderDate: { type: Date, default: Date.now },
  orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }], // ✅ References Order Items
  totalAmount: { type: Number, required: true },
  address: { type: String, required: true },
  location: { type: Object, required: true }, // ✅ Stores Latitude & Longitude
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], 
    default: "Pending" 
  },
  paymentMethod: { type: String, enum: ["Cash", "PayPal"], required: true },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  paymentId: { type: String }, // ✅ Stores PayPal Transaction ID
  currency: { type: String, default: "USD" }, // ✅ Store currency type (optional)
  transactionDetails: { type: Object }, // ✅ Store full PayPal response if needed
}, { timestamps: true }); // ✅ Adds createdAt & updatedAt

module.exports = mongoose.model("Order", orderSchema);

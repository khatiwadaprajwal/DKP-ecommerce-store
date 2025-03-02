const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
}, { timestamps: true }); // ✅ Adds createdAt & updatedAt

module.exports = mongoose.model("OrderItem", orderItemSchema);

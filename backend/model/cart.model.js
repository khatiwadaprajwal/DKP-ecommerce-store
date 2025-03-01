const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }], // Add this line
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Cart", cartSchema);

const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cartItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CartItem"
    }
  ]
});

module.exports = mongoose.model("Cart", CartSchema);

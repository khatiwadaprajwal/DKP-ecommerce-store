const mongoose = require("mongoose");

const userReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });


userReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const UserReview = mongoose.model("UserReview", userReviewSchema);
module.exports = UserReview;

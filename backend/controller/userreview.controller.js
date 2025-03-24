const UserReview = require("../model/userreview.model");
const Product = require("../model/productmodel");

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, reviewText } = req.body;
    const userId = req.user._id; 
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Create a new review
    const review = new UserReview({ userId, productId, rating, reviewText });
    await review.save();
    await updateProductRating(productId);

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
};


exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await UserReview.find({ productId })
      .populate("userId", "name email ") // Populate user details
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};


exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const reviews = await UserReview.find({ userId })
      .populate("productId", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("❌ Error fetching user reviews:", error);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
};


exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user._id;

    // Find and update review
    const review = await UserReview.findOneAndUpdate(
      { _id: reviewId, userId },
      { rating, reviewText, updatedAt: Date.now() },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }
    await updateProductRating(review.productId);

    res.status(200).json({ message: "Review updated successfully", review });

  } catch (error) {
    console.error("❌ Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await UserReview.findOneAndDelete({ _id: reviewId, userId });

    if (!review) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

const updateProductRating = async (productId) => {
    const reviews = await UserReview.find({ productId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;
  
    await Product.findByIdAndUpdate(productId, {
      averageRating: averageRating.toFixed(1), 
      totalReviews,
    });
  };
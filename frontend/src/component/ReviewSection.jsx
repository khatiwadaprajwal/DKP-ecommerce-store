import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthProvider"; // ✅ Use Auth Context
import api from "../config/api"; // ✅ Use centralized API

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Contexts
  const { averageRating, setAverageRating, totalReviews, setTotalReviews } = useContext(ShopContext);
  const { user, token } = useAuth(); // ✅ Get user and token directly from AuthProvider

  const currentUserId = user?._id || user?.userId || user?.id;

  // Fetch reviews for the product
  const fetchReviews = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      // ✅ api.get handles BaseURL automatically
      const response = await api.get(`/v1/review/${productId}`);

      if (response.status === 200) {
        const reviewsArray = response.data.reviews || response.data;
        setReviews(reviewsArray);
        
        // Calculate average rating
        if (reviewsArray.length > 0) {
          const total = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating((total / reviewsArray.length).toFixed(1));
          setTotalReviews(reviewsArray.length);
        } else {
          setAverageRating("0.0");
          setTotalReviews(0);
        }
        
        // Check for existing user review
        if (currentUserId) {
          const found = reviewsArray.find(review => {
            const rUid = (review.userId && typeof review.userId === 'object') ? review.userId._id : review.userId;
            return rUid === currentUserId;
          });
          
          if (found) {
            setUserReview(found);
            setNewReview(found.reviewText || "");
            setRating(found.rating || 0);
          } else {
            setUserReview(null);
            setNewReview("");
            setRating(0);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId, currentUserId]); // Re-fetch if user changes (login/logout)

  const handleAddReview = async () => {
    if (!token) return setError("Please login to review");
    
    if (newReview.trim() && rating > 0) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        if (userReview) {
          // Update existing review
          // ✅ api.put handles headers and BaseURL
          await api.put(`/v1/updatereview/${userReview._id}`, {
            rating,
            reviewText: newReview
          });
          
          fetchReviews();
          setShowReviewForm(false);
        } else {
          // Add new review
          try {
            await api.post(`/v1/addreview`, {
              productId,
              rating,
              reviewText: newReview
            });
            
            fetchReviews();
            setShowReviewForm(false);
          } catch (err) {
            // Duplicate Key Error Handling (Retry as Update)
            if (err.response?.data?.error?.includes("duplicate") || err.response?.data?.error?.includes("E11000")) {
              await fetchReviews(); // Refresh to find the existing review
              if (userReview) {
                await api.put(`/v1/updatereview/${userReview._id}`, {
                  rating,
                  reviewText: newReview
                });
                fetchReviews();
                setShowReviewForm(false);
              }
            } else {
              throw err;
            }
          }
        }
      } catch (err) {
        console.error("Error submitting review:", err);
        setError(err.response?.data?.error || "Failed to submit review");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError("Please provide both rating and review text");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        setIsSubmitting(true);
        // ✅ api.delete handles headers
        await api.delete(`/v1/delete/${reviewId}`);
        
        if (userReview && userReview._id === reviewId) {
          setUserReview(null);
          setNewReview("");
          setRating(0);
          setShowReviewForm(false);
        }
        
        fetchReviews();
      } catch (err) {
        console.error("Error deleting review:", err);
        setError("Failed to delete review");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReviewButtonClick = () => {
    if (!token) {
      // You might want to redirect to login here or show a toast
      alert("Please login to write a review");
      return;
    }
    
    if (userReview) {
      setNewReview(userReview.reviewText);
      setRating(userReview.rating);
    } else {
      setNewReview("");
      setRating(0);
    }
    setShowReviewForm(!showReviewForm);
  };

  // Helper to check ownership
  const isUserReview = (review) => {
    if (!currentUserId) return false;
    const rUid = (review.userId && typeof review.userId === 'object') ? review.userId._id : review.userId;
    return rUid === currentUserId;
  };


  return (
    <div className="space-y-6 text-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
        {isLoggedIn ? (
          <button 
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-black hover:text-white transition-colors"
            onClick={handleReviewButtonClick}
            disabled={isLoading}
          >
            {userReview ? "Edit Your Review" : "Write a Review"}
          </button>
        ) : (
          <a 
            href="/login" 
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-black hover:text-white transition-colors"
          >
            Login to Review
          </a>
        )}
      </div>

      {/* Rating Summary */}
      <div className="flex items-center space-x-4">
        <div className="text-5xl font-bold">{averageRating > 0 ? averageRating : "0.0"}</div>
        <div>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, index) => (
              <span 
                key={index} 
                className={`text-2xl ${index < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-gray-500">{totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}</p>
        </div>
      </div>

      {/* Review Input */}
      {showReviewForm && (
        <div className="border p-6 rounded-md">
          {error && <div className="mb-4 text-red-500">{error}</div>}
          {userReview && (
            <div className="mb-4 bg-blue-50 p-3 rounded-md text-blue-700">
              You're editing your existing review for this product.
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-2">Your Rating</label>
            <div className="flex text-2xl">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  onClick={() => setRating(index + 1)}
                  className={`cursor-pointer ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3"
            rows="4"
            placeholder="Write your review here..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
          />
          <div className="flex justify-between mt-4">
            <button
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
              onClick={handleAddReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
            </button>
            {userReview && (
              <button
                className="text-red-500 px-6 py-2 rounded-md border border-red-500 hover:bg-red-50 transition-colors"
                onClick={() => handleDeleteReview(userReview._id)}
                disabled={isSubmitting}
              >
                Delete Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      )}

      {/* Existing Reviews */}
      {!isLoading && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-300 pb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {/* Display the user name from the nested userId object if available */}
                    {review.userId && typeof review.userId === 'object' && review.userId.name 
                      ? review.userId.name 
                      : (review.userName || "User")}
                  </span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xl ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {/* Indicator showing this is the user's review */}
                  {isUserReview(review) && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Your Review</span>
                  )}
                </div>
                <span className="text-gray-500 text-sm">
                  {review.createdAt 
                    ? format(new Date(review.createdAt), "MMM dd, yyyy") 
                    : "Recent"}
                </span>
              </div>
              <p>{review.reviewText}</p>
              
              {/* Edit/Delete buttons directly on the review */}
              {isUserReview(review) && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-600 text-sm hover:text-red-800 transition-colors"
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !isLoading ? (
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
      ) : null}
    </div>
  );
};

export default ReviewSection;
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ShopContext } from "../context/ShopContext";

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { averageRating, setAverageRating, totalReviews, setTotalReviews, backend_url } = useContext(ShopContext);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Check if user is logged in and get user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      
      // Extract user ID from stored user data
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          // FIX: Try multiple possible ID properties
          const userId = parsedUserData._id || parsedUserData.userId || parsedUserData.id;
          setCurrentUserId(userId);
          console.log("Current User ID:", userId); // Debug log
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  // Fetch reviews for the product and check if the user has already reviewed
  const fetchReviews = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${backend_url}/v1/review/${productId}`);

      if (response.status === 200) {
        const reviewsArray = response.data.reviews || response.data;
        setReviews(reviewsArray);
        
        // Calculate average rating and total reviews
        if (reviewsArray.length > 0) {
          const total = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating((total / reviewsArray.length).toFixed(1));
          setTotalReviews(reviewsArray.length);
        } else {
          setAverageRating("0.0");
          setTotalReviews(0);
        }
        
        // Check if current user has already reviewed
        checkForExistingUserReview(reviewsArray);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the current user has already reviewed this product
  const checkForExistingUserReview = (reviewsArray) => {
    if (!reviewsArray) return;
    
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        // FIX: Use consistent ID property
        const userId = parsedUserData._id || parsedUserData.userId || parsedUserData.id;
        
        // Look for reviews by this user
        const userReviewFound = reviewsArray.find(review => {
          // Get the review's user ID
          const reviewUserId = (review.userId && typeof review.userId === 'object') 
            ? review.userId._id 
            : review.userId;
          
          console.log("Checking review userId:", reviewUserId, "against current userId:", userId); // Debug log
          return reviewUserId === userId;
        });
        
        if (userReviewFound) {
          setUserReview(userReviewFound);
          setNewReview(userReviewFound.reviewText || "");
          setRating(userReviewFound.rating || 0);
        } else {
          // Reset if no user review found
          setUserReview(null);
          setNewReview("");
          setRating(0);
        }
      } catch (error) {
        console.error("Error checking for existing user review:", error);
      }
    }
  };

  useEffect(() => {
    // Fetch reviews when component mounts or productId changes
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleAddReview = async () => {
    if (newReview.trim() && rating > 0) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // Check if user already has a review
        if (userReview) {
          // Update existing review
          await axios.put(`${backend_url}/v1/updatereview/${userReview._id}`, {
            rating,
            reviewText: newReview
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          
          // Refresh reviews after update
          fetchReviews();
          setShowReviewForm(false);
        } else {
          // Add new review
          try {
            await axios.post(`${backend_url}/v1/addreview`, {
              productId,
              rating,
              reviewText: newReview
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            });
            
            // Refresh reviews after submission
            fetchReviews();
            setShowReviewForm(false);
          } catch (err) {
            // If error is due to duplicate review
            if (err.response?.status === 500 && 
                (err.response?.data?.error?.includes("duplicate key error") || 
                 err.response?.data?.error?.includes("E11000"))) {
              
              // Fetch reviews again to get the user's existing review
              await fetchReviews();
              
              // If user review was found, update it
              if (userReview) {
                await axios.put(`${backend_url}/v1/updatereview/${userReview._id}`, {
                  rating,
                  reviewText: newReview
                }, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                  }
                });
                
                // Refresh reviews again after update
                fetchReviews();
                setShowReviewForm(false);
              }
            } else {
              // Other error
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

  const handleEditReview = (review) => {
    setUserReview(review);
    setNewReview(review.reviewText || "");
    setRating(review.rating || 0);
    setShowReviewForm(true);
    // Scroll to the form
    window.scrollTo({ top: 550, behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        setIsSubmitting(true);
        await axios.delete(`${backend_url}/v1/delete/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        // Clear user review data if it matches the deleted review
        if (userReview && userReview._id === reviewId) {
          setUserReview(null);
          setNewReview("");
          setRating(0);
          setShowReviewForm(false);
        }
        
        // Refresh reviews after deletion
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
    if (userReview) {
      // User already has a review, open form to edit
      setNewReview(userReview.reviewText);
      setRating(userReview.rating);
      setShowReviewForm(!showReviewForm);
    } else {
      // New review
      setNewReview("");
      setRating(0);
      setShowReviewForm(!showReviewForm);
    }
  };

  // Check if a review belongs to the current user
  const isUserReview = (review) => {
    if (!currentUserId) {
      console.log("No current user ID"); // Debug log
      return false;
    }
    
    // Get the review's user ID
    const reviewUserId = (review.userId && typeof review.userId === 'object') 
      ? review.userId._id 
      : review.userId;
    
    console.log("Comparing review userId:", reviewUserId, "with current userId:", currentUserId); // Debug log
    return reviewUserId === currentUserId;
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
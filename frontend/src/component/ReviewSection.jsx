import React, { useState } from "react";

const ReviewSection = ({ reviews }) => {
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);

  const handleAddReview = () => {
    if (newReview.trim()) {
      console.log("New Review:", newReview, "Rating:", rating);
      setNewReview("");
      setRating(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
        <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-black hover:text-white">
          Write a Review
        </button>
      </div>

      {/* Rating Summary */}
      <div className="flex items-center space-x-4">
        <div className="text-5xl font-bold">0.0</div>
        <div>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, index) => (
              <span key={index} className="text-2xl">★</span>
            ))}
          </div>
          <p className="text-gray-500">0 Reviews</p>
        </div>
      </div>

      {/* Review Input */}
      <div className="border p-6 rounded-md">
        <div className="mb-4">
          <label className="block mb-2">Your Rating</label>
          <div className="flex text-yellow-400 text-2xl">
            {[...Array(5)].map((_, index) => (
              <span 
                key={index} 
                onClick={() => setRating(index + 1)}
                className={`cursor-pointer ${index < rating ? 'text-yellow-600' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <textarea
          className="w-full border-gray-300 rounded-md p-3"
          rows="4"
          placeholder="Write your review here..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        />
        <button 
          className="bg-black text-white px-6 py-2 rounded-md mt-4 hover:bg-gray-800"
          onClick={handleAddReview}
        >
          Submit Review
        </button>
      </div>

      {/* Existing Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="border-b border-gray-300 pb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">★</span>
                  ))}
                </div>
                <span className="text-gray-500 text-sm">Date here</span>
              </div>
              <p>{review}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
};

export default ReviewSection;
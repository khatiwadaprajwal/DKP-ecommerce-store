import React, { useState } from "react";

const ReviewSection = ({ reviews }) => {
  const [newReview, setNewReview] = useState("");

  const handleAddReview = () => {
    if (newReview.trim()) {
      console.log("New Review:", newReview);
      setNewReview("");
    }
  };


  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-3">Customer Reviews</h2>

      {/* Display Reviews */}
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <p key={index} className="border-b py-2">{review}</p>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}

      {/* Add Review Input */}
      <div className="mt-4">
        <textarea
          className="w-full border rounded-md p-2"
          rows="3"
          placeholder="Write a review..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2" onClick={handleAddReview}>
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default ReviewSection;

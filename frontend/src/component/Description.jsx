import React from "react";

const Description = ({ description }) => {
  return (
    <div className="space-y-6 text-lg">
      <p className="text-gray-700 leading-relaxed">
        {description || "No description available for this product."}
      </p>
    </div>
  );
};

export default Description;
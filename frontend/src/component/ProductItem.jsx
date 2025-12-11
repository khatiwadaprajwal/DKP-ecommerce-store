import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useContext } from "react";
import { motion } from "framer-motion";

const ProductItem = ({ id, name, image, price, rating }) => {
  const { currency, backend_url } = useContext(ShopContext);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  // ✅ SMART IMAGE HELPER
  // This ensures Cloudinary images don't get broken by adding localhost prefix
  const getImageUrl = (img) => {
    if (!img) return ""; // Return empty string or placeholder if needed
    if (img.startsWith("http")) return img; // It's a Cloudinary URL
    return `${backend_url}/public/${img}`; // It's a local legacy image
  };

  return (
    <motion.div 
      className="group relative bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={handleProductClick}
    >
      <div className="w-full overflow-hidden bg-gray-200 relative h-64">
        {/* ✅ UPDATED SRC LOGIC */}
        <img
          src={getImageUrl(image)}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=No+Image"; }}
        />
        
        {/* Quick actions overlay in top right corner - visible only on hover */}
        <div 
          className={`absolute top-2 right-2 flex flex-col space-y-2 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
            aria-label="Quick view"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${id}`);
            }}
          >
            <svg className="h-5 w-5 text-gray-800 text-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
            aria-label="Add to wishlist"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-5 w-5 text-gray-800 text-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
            aria-label="Add to cart"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-5 w-5 text-gray-800 text-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm font-bold text-gray-700 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {name.slice(0,35)}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            {currency} {price}
          </p>
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-xs text-gray-500">({rating})</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductItem;
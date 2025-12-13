import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";

// ✅ Optimization: Define URL outside the component
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const ProductItem = ({ id, name = "Unknown Product", image, price = 0, rating = 0 }) => {
  const { currency } = useContext(ShopContext);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  // ✅ Robust Image Helper
  const getImageUrl = (imgProp) => {
    if (!imgProp) return "https://via.placeholder.com/300?text=No+Image";

    // 1. Handle Array (Take first image)
    let img = Array.isArray(imgProp) ? imgProp[0] : imgProp;

    if (!img) return "https://via.placeholder.com/300?text=No+Image";

    // 2. Handle External URLs (Cloudinary, S3, etc.)
    if (img.startsWith("http") || img.startsWith("https")) {
      return img;
    }

    // 3. Handle Local/Relative URLs
    // Remove leading slash to ensure clean concatenation
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;

    // NOTE: Change '/public/' to '/images/' or '/uploads/' depending on your backend static folder
    return `${BACKEND_URL}/public/${cleanPath}`; 
  };

  const displayImage = getImageUrl(image);

  return (
    <motion.div 
      className="group relative bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer rounded-lg border border-gray-100"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={handleProductClick}
    >
      {/* Image Section */}
      <div className="w-full overflow-hidden bg-gray-200 relative aspect-[3/4]">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Error"; }}
        />
        
        {/* Quick View Button Overlay */}
        <div 
          className={`absolute top-2 right-2 flex flex-col space-y-2 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button 
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm text-gray-700"
            aria-label="View Details"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${id}`);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Details Section */}
      <div className="p-4">
        <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
          {name}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-lg font-bold text-gray-900">
            {currency} {price}
          </p>
          
          <div className="flex items-center gap-1">
            <svg className={`h-4 w-4 ${Number(rating) >= 1 ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">
              {(Number(rating) || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductItem;
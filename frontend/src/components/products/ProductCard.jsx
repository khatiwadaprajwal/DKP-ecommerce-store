import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden group">
        <img
          src={product.images[0]}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Quick View
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.productName}
          </h3>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <button className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Product Variants */}
        {product.variants && (
          <div className="mt-3 flex items-center space-x-2">
            {product.variants.map((variant, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:border-blue-500"
                style={{ backgroundColor: variant.color }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard; 
import React from "react";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";

const RelatedProducts = ({ products, totalPages, currentPage, onPageChange }) => {
  if (products.length === 0) {
    return <p className="text-gray-500 italic">No related products found.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <div 
            key={product._id} 
            className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
          >
            <Link to={`/product/${product._id}`} className="block">
              <div className="relative pt-[100%] overflow-hidden">
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Quick view overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-black text-sm font-medium px-3 py-1 rounded-md shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    Quick View
                  </span>
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="mt-1 text-sm text-red-600 font-medium">Rs. {product.price.toLocaleString()}</p>
                
                {/* Size indicators */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.sizes && product.sizes.slice(0, 3).map((size) => (
                    <span key={size} className="inline-block text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                      {size}
                    </span>
                  ))}
                  {product.sizes && product.sizes.length > 3 && (
                    <span className="inline-block text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                      +{product.sizes.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
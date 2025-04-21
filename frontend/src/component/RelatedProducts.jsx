import React from "react";
import ProductItem from "./ProductItem";
import Pagination from "./Pagination";

const RelatedProducts = ({ products, totalPages, currentPage, onPageChange }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No related products found
      </div>
    );
  }

  return (
    <div className="related-products">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      
      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductItem
            key={product._id}
            id={product._id}
            name={product.productName}
            image={product.images[0]}
            price={product.price}
            rating={product.averageRating}
          />
        ))}
      </div>

      {/* Use your existing Pagination component */}
      {totalPages > 1 && (
        <div className="mt-8">
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
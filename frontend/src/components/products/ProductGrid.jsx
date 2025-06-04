import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

const ProductGrid = ({ products }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 shrink-0"
          >
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold mb-4">Filters</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span>$1000</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  {['Men', 'Women', 'Kids'].map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-blue-600" />
                      <span className="text-sm text-gray-600">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-sm font-medium mb-2">Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {['red', 'blue', 'green', 'yellow', 'black', 'white'].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-blue-500"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid; 
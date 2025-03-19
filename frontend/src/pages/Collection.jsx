import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import ProductItem from "../component/ProductItem";
import { ShopContext } from "../context/ShopContext";
import Pagination from "../component/Pagination";
import Breadcrumbs from "../component/Breadcrumbs";
import Filter from "../component/Filter";
import { motion } from "framer-motion";

const Collection = () => {
  const { 
    filterProducts, 
    applyFilter, 
    setFilterProducts, 
    category,
    gender,
    resetAllFilters
  } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [sortType, setSortType] = useState("Relevant");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 16;

  // Sorting logic
  const sortProduct = () => {
    let filterProductCopy = [...filterProducts];
    switch (sortType) {
      case "low-high":
        setFilterProducts(filterProductCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(filterProductCopy.sort((a, b) => b.price - a.price));
        break;
      case "newest":
        setFilterProducts(
          filterProductCopy.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        break;
      case "best-selling":
        setFilterProducts(
          filterProductCopy.sort((a, b) => b.totalSold - a.totalSold)
        );
        break;
      case "top-rated":
        setFilterProducts(
          filterProductCopy.sort((a, b) => b.averageRating - a.averageRating)
        );
        break;
      default:
        // Default sorting (Relevant)
        applyFilter();
        break;
    }
  };

  // Apply sorting when sort type changes
  useEffect(() => {
    sortProduct();
  }, [sortType]);

  // Calculate pagination
  const totalPages = Math.ceil(filterProducts.length / itemsPerPage);
  const paginatedProducts = filterProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (selected) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get the current selected category and gender for display
  const getCollectionTitle = () => {
    let title = [];
    
    if (gender.length > 0) {
      title.push(gender.join(" & "));
    }
    
    if (category.length > 0) {
      title.push(category.join(" & "));
    }
    
    if (title.length === 0) return "All Products";
    return title.join(" - ");
  };

  const collectionTitle = getCollectionTitle();

  // Get breadcrumb items
  const getBreadcrumbItems = () => {
    const items = [
      { name: "Home", link: "/" },
      { name: "Collections", link: "/collection" }
    ];
    
    if (gender.length > 0) {
      items.push({ name: gender.join(" & "), link: "" });
    }
    
    if (category.length > 0) {
      items.push({ name: category.join(" & "), link: "" });
    }
    
    return items;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <Breadcrumbs items={getBreadcrumbItems()} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {collectionTitle}
        </h1>

        {/* Filter and Sort Controls */}
        <div className="filter-sort flex justify-between items-center mb-6">
          <div
            className="filter-toggle flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition"
            onClick={() => setShowFilter(!showFilter)}
          >
            <img src={assets.filter} alt="filter" className="w-5 h-5" />
            <p className="font-medium">Filter</p>
          </div>
          <div className="sort">
            <select
              onChange={(e) => setSortType(e.target.value)}
              value={sortType}
              className="border border-gray-300 rounded-lg py-2 px-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Relevant">Relevant</option>
              <option value="newest">Newest</option>
              <option value="low-high">Price (Low to High)</option>
              <option value="high-low">Price (High to Low)</option>
              <option value="best-selling">Best Selling</option>
              <option value="top-rated">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="collection-container flex flex-col lg:flex-row gap-8">
          {/* Filter Component */}
          <Filter showFilter={showFilter} setShowFilter={setShowFilter} />

          {/* Product Grid */}
          <div className="flex-1">
            {/* Product count info */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {paginatedProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{filterProducts.length}</span>{" "}
                products
              </p>
            </div>

            {/* Products */}
            {paginatedProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {paginatedProducts.map((product, index) => (
                  <motion.div
                    key={`${product._id}-${index}`}
                    variants={itemVariants}
                  >
                    <ProductItem
                      id={product._id}
                      name={product.productName} // Updated from name to productName
                      image={
                        product.images instanceof Array
                          ? product.images[0] // Updated from image to images
                          : product.images
                      }
                      price={product.price}
                      colors={product.color} // Updated from colors to color
                      category={product.category}
                      rating={product.averageRating} // Added rating
                      gender={product.gender} // Added gender
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your filter criteria
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
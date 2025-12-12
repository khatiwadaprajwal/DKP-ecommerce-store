import React, { useContext, useEffect, useState } from "react";
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
    resetAllFilters,
    backend_url,
  } = useContext(ShopContext);

  // ✅ CHANGED: Default state is now FALSE (Hidden by default)
  const [showFilter, setShowFilter] = useState(false);
  const [sortType, setSortType] = useState("Newest");

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
      case "Newest":
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
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const totalPages = Math.ceil(filterProducts.length / itemsPerPage);
  const paginatedProducts = filterProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (selected) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCollectionTitle = () => {
    let title = [];
    if (gender.length > 0) title.push(gender.join(" & "));
    if (category.length > 0) title.push(category.join(" & "));
    return title.length === 0 ? "All Products" : title.join(" - ");
  };

  const collectionTitle = getCollectionTitle();

  const getBreadcrumbItems = () => {
    const items = [
      { name: "Home", link: "/" },
      { name: "Collections", link: "/collection" },
    ];
    if (gender.length > 0) items.push({ name: gender.join(" & "), link: "" });
    if (category.length > 0) items.push({ name: category.join(" & "), link: "" });
    return items;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs className="text-sm text-gray-500" items={getBreadcrumbItems()} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-serif text-gray-900 tracking-wide">
                {collectionTitle}
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                    Discover our latest arrivals and timeless pieces.
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                
                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 
                    ${showFilter 
                        ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                    {showFilter ? (
                         // Close Icon
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                         </svg>
                    ) : (
                        // Filter Icon
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 6H20M7 12H17M10 18H14"/>
                        </svg>
                    )}
                    <span>{showFilter ? "Hide Filters" : "Show Filters"}</span>
                </button>

                {/* Sort Dropdown */}
                <div className="relative group">
                    <select
                        onChange={(e) => setSortType(e.target.value)}
                        value={sortType}
                        className="appearance-none cursor-pointer bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 hover:border-gray-400 transition-all"
                    >
                        <option value="Relevant">Sort by: Relevant</option>
                        <option value="Newest">Sort by: Newest</option>
                        <option value="low-high">Price: Low to High</option>
                        <option value="high-low">Price: High to Low</option>
                        <option value="best-selling">Best Selling</option>
                        <option value="top-rated">Top Rated</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <div className="collection-container flex flex-col lg:flex-row gap-8">
          
          {/* Filter Component - Sidebar */}
          {/* Default hidden (w-0 h-0) -> expands on click */}
          <div 
            className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden
            ${showFilter ? 'w-full lg:w-64 opacity-100' : 'w-0 h-0 opacity-0'}`}
          >
             {/* Inner content wrapper ensuring width exists while animating */}
             <div className="w-full lg:w-64">
                <Filter showFilter={true} setShowFilter={setShowFilter} />
             </div>
          </div>

          {/* Product Grid Area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <p className="text-gray-500 text-sm">
                Showing <span className="font-bold text-gray-900">{paginatedProducts.length}</span> results
              </p>
              {filterProducts.length !== paginatedProducts.length && (
                  <p className="text-xs text-gray-400">Total: {filterProducts.length}</p>
              )}
            </div>

            {paginatedProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {paginatedProducts.map((product, index) => {
                  let finalImage = "";
                  if (product.images && product.images.length > 0) {
                    const rawImg = product.images[0];
                    if (rawImg.startsWith("http") || rawImg.startsWith("https")) {
                      finalImage = rawImg;
                    } else {
                      finalImage = `${backend_url}/public/${rawImg}`;
                    }
                  } else {
                    finalImage = "https://via.placeholder.com/300?text=No+Image";
                  }

                  return (
                    <motion.div
                      key={`${product._id}-${index}`}
                      variants={itemVariants}
                    >
                      <ProductItem
                        id={product._id}
                        name={product.productName}
                        image={finalImage}
                        price={product.price}
                        rating={product.averageRating}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                <p className="text-gray-500 mt-1 mb-6 max-w-xs mx-auto">
                  We couldn't find any items matching your filters.
                </p>
                <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition shadow-md"
                  >
                    Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
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
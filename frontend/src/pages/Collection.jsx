import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import ProductItem from "../component/ProductItem";
import { ShopContext } from "../context/ShopContext";
import Pagination from "../component/Pagination";
import Breadcrumbs from "../component/Breadcrumbs";
import { motion } from "framer-motion";

const Collection = () => {
  const {
    products,
    filterProducts,
    category,
    sizes,
    toggleCategory,
    toggleSizes,
    applyFilter,
    setFilterProducts,
    setCategory,
  } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [sortType, setSortType] = useState("Relevant");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 16;

  // State to track checkbox status
  const [checkedCategories, setCheckedCategories] = useState({
    All: category.length === 0,
    Men: category.includes("Men"),
    Women: category.includes("Women"),
    Kids: category.includes("Kids"),
  });

  // Handle category checkbox change
  const handleCategoryChange = (categoryValue) => {
    if (categoryValue === "All") {
      // If "All" is selected, uncheck all other categories
      setCheckedCategories({
        All: true,
        Men: false,
        Women: false,
        Kids: false,
      });
      setCategory([]);
    } else {
      // If a specific category is selected, handle it accordingly
      const newCheckedState = !checkedCategories[categoryValue];

      // Update the checked state for this category
      setCheckedCategories((prev) => ({
        ...prev,
        [categoryValue]: newCheckedState,
        // If we're checking a specific category, uncheck "All"
        All: false,
      }));

      // Update the category array for filtering
      if (newCheckedState) {
        // Add this category if it's being checked
        toggleCategory(categoryValue);
      } else {
        // Remove this category if it's being unchecked
        toggleCategory(categoryValue);
      }

      // If no categories are selected, check "All"
      const updatedChecked = {
        ...checkedCategories,
        [categoryValue]: newCheckedState,
        All: false,
      };

      if (
        !updatedChecked.Men &&
        !updatedChecked.Women &&
        !updatedChecked.Kids
      ) {
        setCheckedCategories((prev) => ({
          ...prev,
          All: true,
        }));
        setCategory([]);
      }
    }
  };

  // State to track size checkbox status
  const [checkedSizes, setCheckedSizes] = useState({
    S: sizes.includes("S"),
    M: sizes.includes("M"),
    L: sizes.includes("L"),
    XL: sizes.includes("XL"),
    XXL: sizes.includes("XXL"),
  });

  // Handle size checkbox change
  const handleSizeChange = (size) => {
    setCheckedSizes((prev) => ({
      ...prev,
      [size]: !prev[size],
    }));

    toggleSizes(size);
  };

  // Additional filter options
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [colors, setColors] = useState([]);
  const colorOptions = ["Black", "White", "Blue", "Red", "Green"];

  const handleColorToggle = (color) => {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

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
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  // Update checkbox states when category changes from context
  useEffect(() => {
    setCheckedCategories({
      All: category.length === 0,
      Men: category.includes("Men"),
      Women: category.includes("Women"),
      Kids: category.includes("Kids"),
    });
  }, [category]);

  // Update checkbox states when sizes change from context
  useEffect(() => {
    setCheckedSizes({
      S: sizes.includes("S"),
      M: sizes.includes("M"),
      L: sizes.includes("L"),
      XL: sizes.includes("XL"),
      XXL: sizes.includes("XXL"),
    });
  }, [sizes]);

  // Pagination Logic
  const totalPages = Math.ceil(filterProducts.length / itemsPerPage);
  const paginatedProducts = filterProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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

  // Get the current selected category for display
  const getSelectedCategory = () => {
    if (checkedCategories.All) return "All";
    const selected = Object.keys(checkedCategories).filter(
      (key) => key !== "All" && checkedCategories[key]
    );
    return selected.length > 0 ? selected.join(", ") : "All";
  };

  const selectedCategory = getSelectedCategory();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { name: "Home", link: "/" },
          { name: "Collections", link: "/collection" },
          {
            name: selectedCategory !== "All" ? selectedCategory : "",
            link: "",
          },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {selectedCategory !== "All"
            ? `${selectedCategory} Collection`
            : "All Collections"}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Section - Mobile Toggle */}
          <div className="lg:hidden w-full bg-white p-4 rounded-xl shadow-sm mb-4">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="w-full flex justify-between items-center py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="font-semibold">Filters</span>
              <img
                className={`h-3 transition-transform duration-300 ${
                  showFilter ? "rotate-180" : ""
                }`}
                src={assets.dropdown_icon}
                alt="Toggle filters"
              />
            </button>
          </div>

          {/* Filter Section */}
          <div
            className={`${
              showFilter ? "block" : "hidden"
            } lg:block lg:w-64 space-y-6`}
          >
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                Categories
              </h2>
              <div className="space-y-3">
                {["All", "Men", "Women", "Kids"].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      type="checkbox"
                      checked={checkedCategories[item] || false}
                      onChange={() => handleCategoryChange(item)}
                    />
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                Sizes
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <label
                    key={size}
                    className={`flex items-center justify-center h-10 rounded-lg cursor-pointer transition-all ${
                      checkedSizes[size]
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checkedSizes[size] || false}
                      onChange={() => handleSizeChange(size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                Colors
              </h2>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorToggle(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      colors.includes(color)
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : ""
                    }`}
                    style={{
                      backgroundColor: color.toLowerCase(),
                      borderColor:
                        color.toLowerCase() === "white"
                          ? "#e5e7eb"
                          : color.toLowerCase(),
                    }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                Price Range
              </h2>
              <div className="px-2">
                <div className="flex justify-between mb-2">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={applyFilter}
            >
              Apply Filters
            </button>
          </div>

          {/* Right Section */}
          <div className="flex-1">
            {/* Sorting and results count */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 mb-3 sm:mb-0">
                Showing{" "}
                <span className="font-semibold">
                  {paginatedProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{filterProducts.length}</span>{" "}
                products
              </p>

              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort by:</span>
                <select
                  onChange={(e) => setSortType(e.target.value)}
                  className="border border-gray-300 rounded-lg py-2 px-3 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevant">Relevant</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {paginatedProducts.map((item, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <ProductItem
                      name={item.name}
                      id={item._id}
                      price={item.price}
                      image={item.image[0]}
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
                  Try changing your filter criteria or browse our other
                  collections.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory([]);
                      setSizes([]);
                      setCheckedCategories({
                        All: true,
                        Men: false,
                        Women: false,
                        Kids: false,
                      });
                      setCheckedSizes({
                        S: false,
                        M: false,
                        L: false,
                        XL: false,
                        XXL: false,
                      });
                      setColors([]);
                      setPriceRange([0, 5000]);
                      applyFilter();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;

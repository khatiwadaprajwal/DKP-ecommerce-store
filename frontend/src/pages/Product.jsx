import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ReviewSection from "../component/ReviewSection";
import RelatedProducts from "../component/RelatedProducts";
import Description from "../component/Description";
import AdditionalInfo from "../component/AdditionalInfo";
import ShippingInfo from "../component/ShippingInfo";
import QuickOrder from "../component/QuickOrder";
import axios from "axios";

const Product = () => {
  const { productId } = useParams();
  const { addToCart, products, totalReviews } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const [currentPage, setCurrentPage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state for QuickOrder popup
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);

  const itemsPerPage = 4;

  // Fetch single product data using API
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3001/v1/product/${productId}`
      );

      if (response.status === 200) {
        const product = response.data.product;
        setProductData(product);

        // Set the first image as the main image
        if (product.images && product.images.length > 0) {
          setImage(product.images[0]);
        }

        // Extract unique colors and sizes from variants
        const colors = [
          ...new Set(product.variants.map((variant) => variant.color)),
        ];
        setAvailableColors(colors);

        // If colors are available, set the first color as selected by default
        if (colors.length > 0) {
          setSelectedColor(colors[0]);

          // Get sizes available for the selected color
          const sizesForColor = product.variants
            .filter(
              (variant) => variant.color === colors[0] && variant.quantity > 0
            )
            .map((variant) => variant.size);

          setAvailableSizes(sizesForColor);
        }

        // Fetch related products
        fetchRelatedProducts(product.gender, product.category);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products
  const fetchRelatedProducts = async (gender, category) => {
    try {
      if (products) {
        // Filter related products by category and gender, excluding current product
        const related = products.filter(
          (item) =>
            (item.category === category || item.gender === gender) &&
            item._id !== productId
        );

        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0); // Scroll to top when product changes
  }, [productId]);

  // Update available sizes when color changes
  useEffect(() => {
    if (productData && selectedColor) {
      // Get sizes available for the selected color with quantity > 0
      const sizesForColor = productData.variants
        .filter(
          (variant) => variant.color === selectedColor && variant.quantity > 0
        )
        .map((variant) => variant.size);

      setAvailableSizes(sizesForColor);
      setSelectedSize(null); // Reset size selection when color changes
      setSelectedVariant(null); // Reset variant selection
    }
  }, [selectedColor, productData]);

  // Update selected variant when size changes
  useEffect(() => {
    if (productData && selectedColor && selectedSize) {
      const variant = productData.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );

      setSelectedVariant(variant);
      // Reset quantity if it exceeds available quantity
      if (variant && quantity > variant.quantity) {
        setQuantity(Math.min(variant.quantity, 1));
      }
    }
  }, [selectedSize, selectedColor, productData]);

  // Generate breadcrumb path
  const getBreadcrumbs = () => {
    return [
      { name: "Home", path: "/" },
      {
        name: productData?.gender || "Gender",
        path: `/collection?gender=${productData?.gender}`,
      },
      {
        name: productData?.category || "Category",
        path: `/collection?category=${productData?.category}`,
      },
      { name: productData?.productName || "Product", path: "#" },
    ];
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(
        productData._id,
        selectedSize,
        quantity,
        productData.productName,
        productData.price,
        productData.images[0],
        selectedColor
      );
      // Reset quantity after adding to cart
      setQuantity(1);
    }
  };

  // Handle Buy Now click to open QuickOrder popup
  const handleBuyNow = () => {
    if (selectedVariant) {
      setIsQuickOrderOpen(true);
    }
  };

  // Calculate paginated products
  const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
  const paginatedProducts = relatedProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return loading ? (
    <div className="flex justify-center items-center h-screen text-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  ) : productData ? (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6 transition-opacity ease-in duration-300 opacity-100">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-4">
          {getBreadcrumbs().map((crumb, index, array) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="mx-2 text-gray-400">›</span>}
              {index === array.length - 1 ? (
                <span className="font-medium text-black truncate max-w-xs">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-black truncate transition-colors duration-200"
                >
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex gap-8 flex-col md:flex-row">
          {/* Product Image Section - with improved sizing */}
          <div className="md:w-3/5 relative">
            {/* Main image container with improved height */}
            <div className="w-full overflow-hidden relative rounded-lg shadow-md">
              <img
                className="w-full h-auto md:h-[500px] object-contain bg-white"
                src={`http://localhost:3001/public/${image}`}
                alt={productData.productName}
              />
            </div>

            {/* Thumbnails - improved sizing and layout */}
            <div className="grid grid-cols-5 gap-3 mt-4">
              {productData.images.map((item, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer transition-all duration-200 
                    hover:scale-105 rounded-md overflow-hidden
                    ${
                      image === item
                        ? "ring-2 ring-black shadow-md"
                        : "border border-gray-200"
                    }
                  `}
                  onClick={() => setImage(item)}
                >
                  <img
                    src={`http://localhost:3001/public/${item}`}
                    className="w-full h-20 object-cover"
                    alt={`${productData.productName} - view ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info - adjusted width to accommodate larger image */}
          <div className="md:w-2/5 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {productData.productName}
              </h1>
              <p className="text-xl md:text-2xl font-bold text-red-600 mt-1">
                Rs. {productData.price.toLocaleString()}
              </p>
              {/* Rating display */}
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ${
                        star <= Math.round(productData.averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600 text-sm">
                  ({productData.averageRating.toFixed(1)})
                </span>
              </div>
              {/* Availability info */}
              <p className="text-sm mt-1 text-gray-600">
                {productData.totalQuantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    In Stock ({productData.totalQuantity} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-base font-semibold">Description</p>
              <p className="mt-1 text-gray-600 text-sm line-clamp-3">
                {productData.description}
              </p>
            </div>

            {/* Color Selection */}
            <div className="border-t border-gray-200 pt-3">
              <p className="font-semibold text-base mb-2">Select Color:</p>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200
                      ${selectedColor === color ? "transform scale-110" : ""}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    <div
                      className={`h-8 w-8 rounded-full border ${
                        selectedColor === color
                          ? "border-black ring-2 ring-gray-400"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    ></div>
                    <span
                      className={`text-xs mt-1 ${
                        selectedColor === color ? "font-bold" : ""
                      }`}
                    >
                      {color}
                    </span>
                  </div>
                ))}
              </div>
              {!selectedColor && (
                <p className="text-xs text-red-500 mt-1">
                  Please select a color
                </p>
              )}
            </div>

            {/* Size Selection */}
            <div className="border-t border-gray-200 pt-3">
              <p className="font-semibold text-base mb-2">Select Size:</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`h-10 w-10 flex items-center justify-center rounded-md 
                      font-medium text-sm transition-all duration-200 hover:bg-gray-700 hover:text-white
                      ${
                        selectedSize === size
                          ? "bg-black text-white shadow-md transform scale-105"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }
                    `}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedColor && availableSizes.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No sizes available for selected color
                </p>
              )}
              {selectedColor && availableSizes.length > 0 && !selectedSize && (
                <p className="text-xs text-red-500 mt-1">
                  Please select a size
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="border-t border-gray-200 pt-3">
              <p className="font-semibold text-base mb-2">Quantity:</p>
              <div className="inline-flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
                <button
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <span className="text-lg font-medium">-</span>
                </button>
                <div className="w-10 h-8 flex items-center justify-center border-l border-r border-gray-300 bg-white">
                  {quantity}
                </div>
                <button
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  onClick={() =>
                    setQuantity((prev) =>
                      selectedVariant
                        ? Math.min(selectedVariant.quantity, prev + 1)
                        : prev
                    )
                  }
                  disabled={
                    !selectedVariant || quantity >= selectedVariant.quantity
                  }
                >
                  <span className="text-lg font-medium">+</span>
                </button>
              </div>
              {selectedVariant && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedVariant.quantity} available
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-10 rounded-md font-medium text-sm
                  flex items-center justify-center transition-colors duration-300
                  ${
                    selectedVariant && selectedVariant.quantity > 0
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                disabled={!selectedVariant || selectedVariant.quantity === 0}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className={`flex-1 h-10 rounded-md font-medium text-sm
                  flex items-center justify-center transition-colors duration-300
                  ${
                    selectedVariant && selectedVariant.quantity > 0
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                disabled={!selectedVariant || selectedVariant.quantity === 0}
              >
                Buy Now
              </button>
            </div>

            {/* Product guarantees with icons */}
            <div className="border-t border-gray-200 pt-3 text-xs text-gray-600 space-y-2">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p>100% Original product</p>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                <p>Cash on delivery available</p>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <p>Easy 7-day returns & exchanges</p>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Fast shipping within 3-7 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Reviews Section */}
        <div className="mt-10">
          <div className="flex border-b border-gray-300 overflow-x-auto">
            <button
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                activeTab === "description"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab("description")}
            >
              DESCRIPTION
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                activeTab === "additional"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab("additional")}
            >
              ADDITIONAL INFO
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                activeTab === "reviews"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              REVIEWS ({productData.averageRating > 0 ? totalReviews : "0"})
            </button>
            <button
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                activeTab === "shipping"
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab("shipping")}
            >
              SHIPPING & DELIVERY
            </button>
          </div>

          {/* Content for each tab */}
          <div className="py-6">
            {activeTab === "description" && (
              <Description description={productData.description} />
            )}
            {activeTab === "additional" && (
              <AdditionalInfo productData={productData} />
            )}
            {activeTab === "reviews" && <ReviewSection productId={productId} />}
            {activeTab === "shipping" && <ShippingInfo />}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-10 container mx-auto px-4">
          <RelatedProducts
            products={paginatedProducts}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* QuickOrder Popup - Updated props */}
      <QuickOrder
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        productData={productData}
        selectedVariant={selectedVariant}
        selectedSize={selectedSize}
        selectedColor={selectedColor} // Changed from selectedcolor to selectedColor for consistency
        quantity={quantity}
      />
    </div>
  ) : (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl text-gray-700">Product not found</div>
    </div>
  );
};

export default Product;

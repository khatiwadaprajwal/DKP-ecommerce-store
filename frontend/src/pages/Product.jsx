import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify"; 
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../context/AuthProvider"; 
import api from "../config/api"; 

// Component Imports
import ReviewSection from "../component/ReviewSection";
import RelatedProducts from "../component/RelatedProducts";
import Description from "../component/Description";
import AdditionalInfo from "../component/AdditionalInfo";
import ShippingInfo from "../component/ShippingInfo";
import QuickOrder from "../component/QuickOrder";
import { assets } from "../assets/assets"; 

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth(); 
  const { addToCart, products } = useContext(ShopContext);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  
  // State
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  
  // ✅ FIX 1: Add Pagination State for Related Products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Number of related items to show per page
  
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // ✅ FIX 2: Define Modal Close Handler
  const handleModalClose = () => setIsImageModalOpen(false);

  // Helper: Image URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
      return imgPath;
    }
    const cleanPath = imgPath.startsWith("/") ? imgPath.slice(1) : imgPath;
    return `${BACKEND_URL}/public/${cleanPath}`;
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/product/${productId}`);

      if (response.status === 200) {
        const product = response.data.product;

        // Ensure images array exists even if backend returns single 'image'
        if (!product.images && product.image) {
            product.images = Array.isArray(product.image) ? product.image : [product.image];
        }

        setProductData(product);

        if (product.images && product.images.length > 0) {
          setImage(product.images[0]);
        }

        // Setup Variants
        if (product.variants) {
            const colors = [...new Set(product.variants.map((v) => v.color))];
            setAvailableColors(colors);

            if (colors.length > 0) {
            setSelectedColor(colors[0]);
            const sizesForColor = product.variants
                .filter((v) => v.color === colors[0] && v.quantity > 0)
                .map((v) => v.size);
            setAvailableSizes(sizesForColor);
            }
        }

        fetchRelatedProducts(product.gender, product.category);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (gender, category) => {
    if (products && products.length > 0) {
      const related = products.filter(
        (item) =>
          (item.category === category || item.gender === gender) &&
          item._id !== productId
      );
      setRelatedProducts(related);
    }
  };

  // ✅ FIX 3: Calculate Pagination Logic
  const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
  const paginatedProducts = relatedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ FIX 4: Safety check for Total Reviews
  const totalReviews = productData?.numReviews || 0; 

  // --- Effects ---
  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0);
  }, [productId, products]); 

  // Variant Logic
  useEffect(() => {
    if (productData && selectedColor && productData.variants) {
      const sizesForColor = productData.variants
        .filter((v) => v.color === selectedColor && v.quantity > 0)
        .map((v) => v.size);

      setAvailableSizes(sizesForColor);
      
      if (sizesForColor.length > 0) {
        if (sizesForColor.includes('NaN')) {
          setSelectedSize('NaN');
        } else {
          setSelectedSize(null);
        }
      } else {
        setSelectedSize(null);
      }
    }
  }, [selectedColor, productData]);

  useEffect(() => {
    if (productData && selectedColor && selectedSize && productData.variants) {
      const variant = productData.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      setSelectedVariant(variant);
      
      if (variant && quantity > variant.quantity) {
        setQuantity(Math.max(1, variant.quantity)); 
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedSize, selectedColor, productData]);

  // Actions
  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a size/color");
      return;
    }
    addToCart(productData._id, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (!token) {
      toast.error("Please login to purchase");
      navigate("/login");
      return;
    }
    if (!selectedVariant) {
      toast.error("Please select a size/color");
      return;
    }
    setIsQuickOrderOpen(true);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (!productData?.images) return;
    const currentIndex = productData.images.indexOf(image);
    const nextIndex = (currentIndex + 1) % productData.images.length;
    setImage(productData.images[nextIndex]);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (!productData?.images) return;
    const currentIndex = productData.images.indexOf(image);
    const prevIndex = (currentIndex - 1 + productData.images.length) % productData.images.length;
    setImage(productData.images[prevIndex]);
  };

  // Breadcrumbs Helper
  const getBreadcrumbs = () => {
     if(!productData) return [];
     return [
        { name: "Home", path: "/" },
        { name: "Collection", path: "/collection" },
        { name: productData.productName, path: "#" }
     ];
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );

  if (!productData) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl text-gray-700">Product not found</div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6 transition-opacity ease-in duration-300 opacity-100">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 mb-4">
          {getBreadcrumbs().map((crumb, index, array) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-2 text-gray-400">›</span>}
              {index === array.length - 1 ? (
                <span className="font-medium text-black truncate max-w-xs">
                  {crumb.name}
                </span>
              ) : (
                <Link to={crumb.path} className="hover:text-black truncate transition-colors duration-200">
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex gap-8 flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-3/5 relative">
            <div 
              className="w-full overflow-hidden relative rounded-lg shadow-md cursor-zoom-in"
              onClick={() => setIsImageModalOpen(true)}
            >
              <img
                className="w-full h-auto md:h-[450px] object-contain bg-white"
                src={getImageUrl(image)}
                alt={productData.productName}
                onError={(e) => { e.target.src = "https://via.placeholder.com/450?text=Image+Not+Found"; }}
              />
            </div>
            <div className="grid grid-cols-5 gap-3 mt-4">
              {productData.images && productData.images.map((item, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer transition-all duration-200 
                    hover:scale-105 rounded-md overflow-hidden
                    ${image === item ? "ring-2 ring-black shadow-md" : "border border-gray-200"}
                  `}
                  onClick={() => setImage(item)}
                >
                  <img
                    src={getImageUrl(item)}
                    className="w-full h-20 object-cover"
                    alt={`${productData.productName} - view ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="md:w-2/5 space-y-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {productData.productName}
              </h2>
              <p className="text-xl md:text-2xl font-bold text-red-600 mt-1">
                Rs. {productData.price.toLocaleString()}
              </p>
              
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
              <p className="text-sm mt-1 text-gray-600">
                {productData.totalQuantity > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({productData.totalQuantity} available)</span>
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

            {/* Colors */}
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
                    <span className={`text-xs mt-1 ${selectedColor === color ? "font-bold" : ""}`}>{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
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
            </div>

            {/* Quantity */}
            <div className="border-t border-gray-200 pt-3">
              <p className="font-semibold text-base mb-2">Quantity:</p>
              <div className="inline-flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
                <button
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <div className="w-10 h-8 flex items-center justify-center border-l border-r border-gray-300 bg-white">
                  {quantity}
                </div>
                <button
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  onClick={() => setQuantity((prev) => selectedVariant ? Math.min(selectedVariant.quantity, prev + 1) : prev)}
                  disabled={!selectedVariant || quantity >= selectedVariant.quantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-10 rounded-md font-medium text-sm flex items-center justify-center transition-colors duration-300
                  ${selectedVariant && selectedVariant.quantity > 0 ? "bg-black text-white hover:bg-gray-800" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                disabled={!selectedVariant || selectedVariant.quantity === 0}
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className={`flex-1 h-10 rounded-md font-medium text-sm flex items-center justify-center transition-colors duration-300
                  ${selectedVariant && selectedVariant.quantity > 0 ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                disabled={!selectedVariant || selectedVariant.quantity === 0}
              >
                Buy Now
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-3 text-xs text-gray-600 space-y-2">
              <div className="flex items-center"><span className="text-green-500 mr-2">✓</span> 100% Original product</div>
              <div className="flex items-center"><span className="text-green-500 mr-2">✓</span> Cash on delivery available</div>
              <div className="flex items-center"><span className="text-green-500 mr-2">✓</span> Easy 7-day returns</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex border-b border-gray-300 overflow-x-auto">
            {['description', 'additional', 'reviews', 'shipping'].map(tab => (
               <button
                 key={tab}
                 className={`px-4 py-2 text-sm font-semibold uppercase whitespace-nowrap transition-colors duration-200 ${activeTab === tab ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black"}`}
                 onClick={() => setActiveTab(tab)}
               >
                 {tab === 'reviews' ? `REVIEWS (${totalReviews})` : tab.replace('_', ' ')}
               </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "description" && <Description description={productData.description} />}
            {activeTab === "additional" && <AdditionalInfo productData={productData} />}
            {activeTab === "reviews" && <ReviewSection productId={productId} />}
            {activeTab === "shipping" && <ShippingInfo />}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-10 container mx-auto px-4">
          <RelatedProducts
            products={paginatedProducts} // ✅ Passed Correctly
            totalPages={totalPages}     // ✅ Passed Correctly
            currentPage={currentPage}   // ✅ Passed Correctly
            onPageChange={setCurrentPage} // ✅ Passed Correctly
          />
        </div>
      )}

      <QuickOrder
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        productData={productData}
        selectedVariant={selectedVariant}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
      />

      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleModalClose}
        >
          <div className="relative max-w-5xl w-full mx-4 bg-white rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsImageModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative p-4">
              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-800 hover:text-black transition-colors bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                onClick={handlePrevImage}
              >
                ‹
              </button>
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-800 hover:text-black transition-colors bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                onClick={handleNextImage}
              >
                ›
              </button>
              <img
                src={getImageUrl(image)}
                alt={productData.productName}
                className="w-full h-[60vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ReviewSection from "../component/ReviewSection";
import RelatedProducts from "../component/RelatedProducts";
// import Pagination from "../component/Pagination";

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const [currentPage, setCurrentPage] = useState(0);
  
  // UI enhancement state variables
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);
  const imageRef = useRef(null);
  const zoomFactor = 2.5;

  const itemsPerPage = 5;

  const fetchProductData = async () => {
    const foundProduct = products.find((item) => item._id === productId);

    if (foundProduct) {
      setProductData(foundProduct);
      setImage(foundProduct.image[0]);
    }
  };

  const relatedProducts = products.filter(
    (item) => item.category === productData?.category && item._id !== productId
  );

  const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
  const paginatedProducts = relatedProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    fetchProductData();
    // Reset image zoom/enlarge states when product changes
    setIsZoomed(false);
    setShowEnlargedImage(false);
    window.scrollTo(0, 0); // Scroll to top when product changes
  }, [productId]);

  // Generate improved breadcrumb path
  const getBreadcrumbs = () => {
    return [
      { name: "Home", path: "/" },
      { name: productData?.category || "Category", path: `/collection?category=${productData?.category}` },
      { name: productData?.name || "Product", path: "#" }
    ];
  };

  // Handle mouse movement for zoom effect
  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      // We'll handle the error in the addToCart function
      addToCart(
        productData._id,
        selectedSize,
        quantity,
        productData.name,
        productData.price,
        productData.image[0]
      );
    } else {
      addToCart(
        productData._id,
        selectedSize,
        quantity,
        productData.name,
        productData.price,
        productData.image[0]
      );
      // Reset quantity after adding to cart
      setQuantity(1);
    }
  };

  return productData ? (
    <div>
    <div className="pt-6 md:pt-10 transition-opacity ease-in duration-500 opacity-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs - Improved UI */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        {getBreadcrumbs().map((crumb, index, array) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <span className="mx-2 text-gray-400">›</span>}
            {index === array.length - 1 ? (
              <span className="font-medium text-black truncate max-w-xs">{crumb.name}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-black truncate transition-colors duration-200">
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex gap-8 lg:gap-12 flex-col md:flex-row">
        {/* Product Image with Zoom - Improved UI */}
        <div className="md:w-1/2 lg:w-3/5 relative">
          <div 
            className="w-full overflow-hidden relative rounded-lg shadow-sm border border-gray-200" 
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setShowEnlargedImage(true)}
          >
            <img
              ref={imageRef}
              className="w-full h-auto object-contain aspect-square cursor-zoom-in transition-transform duration-200"
              src={image}
              alt={productData.name}
            />
            {isZoomed && (
              <div 
                className="absolute pointer-events-none"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                  background: `url(${image}) no-repeat`,
                  backgroundSize: `${zoomFactor * 100}%`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  left: `${zoomPosition.x}%`,
                  top: `${zoomPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </div>
          
          {/* Enlarged Image Modal - Improved UI */}
          {showEnlargedImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setShowEnlargedImage(false)}
            >
              <div className="relative max-w-4xl max-h-screen">
                <button 
                  className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEnlargedImage(false);
                  }}
                >
                  ✕
                </button>
                <img 
                  src={image} 
                  alt={productData.name} 
                  className="max-w-full max-h-[90vh] object-contain"
                />
              </div>
            </div>
          )}

          {/* Thumbnails with improved UI */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {productData.image.map((item, index) => (
              <div 
                key={index}
                className={`relative cursor-pointer transition-all duration-200 
                  hover:scale-105 rounded-md overflow-hidden
                  ${image === item ? 'ring-2 ring-black shadow-md' : 'border border-gray-200'}
                `}
                onClick={() => setImage(item)}
              >
                <img
                  src={item}
                  className="w-full h-16 object-cover"
                  alt={`${productData.name} - view ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info - Improved UI */}
        <div className="md:w-1/2 lg:w-2/5 space-y-6 mt-6 md:mt-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{productData.name}</h1>
            <p className="text-2xl md:text-3xl font-bold text-red-600 mt-2">
              Rs. {productData.price.toLocaleString()}
            </p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-lg font-semibold">Description</p>
            <p className="mt-2 text-gray-600">
              {productData.description}
            </p>
          </div>

          {/* Size Selection with improved UI */}
          <div className="border-t border-gray-200 pt-4">
            <p className="font-semibold text-lg mb-2">Select Size:</p>
            <div className="flex flex-wrap gap-3">
              {productData.sizes.map((size) => (
                <button
                  key={size}
                  className={`h-12 w-12 flex items-center justify-center rounded-md 
                    font-medium text-base transition-all duration-200 hover:bg-gray-700 hover:text-white
                    ${selectedSize === size
                      ? "bg-black text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
                  `}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-sm text-red-500 mt-2">Please select a size</p>
            )}
          </div>

          {/* Quantity Selector with improved UI */}
          <div className="border-t border-gray-200 pt-4">
            <p className="font-semibold text-lg mb-2">Quantity:</p>
            <div className="inline-flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
              <button
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                <span className="text-xl font-medium">-</span>
              </button>
              <div className="w-12 h-10 flex items-center justify-center border-l border-r border-gray-300 bg-white">
                {quantity}
              </div>
              <button
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                <span className="text-xl font-medium">+</span>
              </button>
            </div>
          </div>

          {/* Action Buttons with improved UI */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white h-12 rounded-md font-medium 
                hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center"
            >
              Add to Cart
            </button>
            <Link to="/placeOrder" className="flex-1">
              <button className="w-full h-12 bg-yellow-500 text-white rounded-md font-medium 
                hover:bg-yellow-600 transition-colors duration-300 flex items-center justify-center">
                Buy Now
              </button>
            </Link>
          </div>

          {/* Product guarantees with icons - Improved UI */}
          <div className="border-t border-gray-200 pt-4 text-sm text-gray-600 space-y-3">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>100% Original product</p>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <p>Cash on delivery available</p>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p>Easy 7-day returns & exchanges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description and Reviews Section - Improved UI */}
      <div className="mt-16">
        <div className="flex border-b border-gray-300 overflow-x-auto">
          <button
            className={`px-6 py-3 text-base font-semibold whitespace-nowrap transition-colors duration-200 ${
              activeTab === "description"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("description")}
          >
            DESCRIPTION
          </button>
          <button
            className={`px-6 py-3 text-base font-semibold whitespace-nowrap transition-colors duration-200 ${
              activeTab === "additional"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("additional")}
          >
            ADDITIONAL INFORMATION
          </button>
          <button
            className={`px-6 py-3 text-base font-semibold whitespace-nowrap transition-colors duration-200 ${
              activeTab === "reviews"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            REVIEWS (0)
          </button>
          <button
            className={`px-6 py-3 text-base font-semibold whitespace-nowrap transition-colors duration-200 ${
              activeTab === "shipping"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("shipping")}
          >
            SHIPPING & DELIVERY
          </button>
        </div>

        {/* Content for each tab - Improved UI */}
        <div className="py-8">
          {activeTab === "description" && (
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Going for a more casual look? You cannot thumb your noses at
                these minimal pair of microfiber casuals from Caliber which is
                fantastic at portraying a casual yet neat look. Slide this
                sneaker on for an easy footwear option that can be styled with
                anything.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">COMFORTABLE FIT</h3>
                <p className="text-gray-700 mt-2">
                  The lace-up closure and closed toe style gives your feet a
                  perfect fit to the shoe.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">IMPRESSIVE DESIGN</h3>
                <p className="text-gray-700 mt-2">
                  Keeping in mind the latest trends in fashion, this sleek pair
                  adds to the style of the outfit. The ways these can be worn
                  are virtually endless, thanks to the stylish street style
                  circuits we're continuously blessed with.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">MADE FOR COMFORT</h3>
                <p className="text-gray-700 mt-2">
                  Sneakers are designed to give maximum comfort.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">CARE INSTRUCTIONS</h3>
                <p className="text-gray-700 mt-2">
                  Allow your pair of footwear to air and deodorize at regular
                  basis; use shoe bags to prevent any stains or mildew; dust any
                  dry dirt from the surface using a clean cloth.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewSection reviews={productData.reviews || []} />
          )}

          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Delivery Time</h3>
                  <p className="text-gray-700 mt-1">Delivery within 3-7 business days.</p>
                </div>
              </div>
              
              <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Free Shipping</h3>
                  <p className="text-gray-700 mt-1">Free shipping on orders over Rs. 2000.</p>
                </div>
              </div>
              
              <div className="flex items-start bg-gray-50 p-4 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Returns & Exchanges</h3>
                  <p className="text-gray-700 mt-1">Easy return and exchange within 7 days of delivery.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
    {/* Related Products - Using new component */}
    <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
        <RelatedProducts 
          products={paginatedProducts} 
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );
};

export default Product;
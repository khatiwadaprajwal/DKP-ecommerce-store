import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/Shopcontext";
import ReviewSection from "../component/ReviewSection";
import { useNavigate, Link } from "react-router-dom";
import ProductItem from "../component/ProductItem";
import Pagination from "../component/Pagination"; // Import the Pagination component

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizes, setSizes] = useState("");
  const navigate = useNavigate();
  const [showReviews, setShowReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Track pagination page

  const itemsPerPage = 5; // Number of products per page
  // const [selectedColor, setSelectedColor] = useState([]);

  const fetchProductData = async () => {
    const foundProduct = products.find((item) => item._id === productId); // ✅ Finds the first matching product

    if (foundProduct) {
      setProductData(foundProduct);
      setImage(foundProduct.image[0]);
      console.log(foundProduct);
    }
  };

  const relatedProducts = products.filter(
    (item) => item.category === productData?.category && item._id !== productId
  );

 // **Paginate Related Products**
 const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
 const paginatedProducts = relatedProducts.slice(
   currentPage * itemsPerPage,
   (currentPage + 1) * itemsPerPage
 );

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  return productData ? (
    <div className=" pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-5 flex-col sm:flex-row">
        {/* Product Image */}
        <div className="flex-1  gap-3 sm:flex-row">
          <div className="w-full">
            <img className="w-full sm:w-[95%] h-auto sm:h-[90%]" src={image} alt="" />
          </div>
          <div className=" hover:transition-110 grid grid-cols-4 gap-4 mt-4  justify-between sm:justify-normal sm:w-[80%] w-[70%]">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[60%] sm:w-full sm:mb-3  cursor-pointer"
              />
            ))}
          </div>
        </div>
        {/* Product Info */}
        <div className="flex-1 space-y-6">
          <h1 className="font-bold text-4xl mt-2">{productData.name}</h1>
          <p className="text-3xl font-bold text-red-600">
            Rs. {productData.price}
          </p>
          <div>
            <p className="text-xl font-semibold">Description:</p>
            <p className="gap-t-1 mt-3 text-base text-gray-600 md:w-4/5">
              {productData.description}
            </p>
          </div>

          {/* Size Selection */}
          <div>
            <p className="font-medium  text-xl mb-2 ">Select Size:</p>
            <div className="flex gap-3 m-y-5">
              {productData.sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2  hover:bg-gray-600 hover:text-white rounded-md ${
                    selectedSize === size
                      ? "bg-black text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 
          <div className="mt-4">
            <div className="flex gap-2">
              {productData.colors?.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-black scale-110"
                      : "border-gray-300"
                  } transition-transform`}
                  style={{ backgroundColor: { color } }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div> */}

          {/* Quantity Selector */}
          <div className="flex items-center gap-3  my-7">
            <p className="font-medium"></p>
            <button
              className="px-3 py-1 bg-gray-200 rounded-md cursor-pointer"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <span className="px-4 py-1 bg-gray-200 rounded-md ">{quantity}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded-md cursor-pointer"
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          {/* Buttons */}
          <div className="flex gap-4 mt-6">
          <button onClick={()=>addToCart(productData._id,selectedSize,quantity)} className= "bg-black text-white cursor-pointer px-8 py-3 rounded-md font-medium hover:bg-gray-700">
                Add to Cart
              </button>
            <Link to={"/order"}>
            <button
              navigate="/order"
              className="bg-yellow-500 cursor-pointer text-white px-8 py-3 rounded-md font-medium  hover:bg-yellow-700"
            >
              Order Now
            </button>
            </Link>
          </div>
          <hr className="mt-8 sm:w-4/5"/>
          <div className="text-sm text-gray-400 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>

        </div>
      </div>

      {/* Review section */}
      <div className="mt-20">
      <div className="flex">
        <p 
          className={`border text-base px-5 py-3 cursor-pointer ${!showReviews ? "bg-black text-white" : "hover:bg-black hover:text-white"}`} 
          onClick={() => setShowReviews(false)}
        >
          Description
        </p>
        <p 
          className={`border text-base px-5 py-3 cursor-pointer ${showReviews ? "bg-black text-white" : "hover:bg-black hover:text-white"}`} 
          onClick={() => setShowReviews(true)}
        >
          Reviews
        </p>
      </div>
    </div>

    {/* Conditional Rendering of ReviewSection */}
    {showReviews && <ReviewSection reviews={productData.reviews || []} />}

      {/* Related Products */}
      {/* Related Products Section with Pagination */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-5">Related Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            ))
          ) : (
            <p className="text-gray-500">No related products found.</p>
          )}
        </div>

        {/* Use the Pagination Component */}
        <Pagination 
          totalPages={totalPages} 
          currentPage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;

import React, { useContext } from "react";
import { ShopContext } from "../context/Shopcontext";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    
    <div
      className="group relative shadow-md overflow-hidden 
                 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Product Image */}
      <Link
        to={`/product/${id}`}
        onClick={handleClick}
        className="block relative overflow-hidden"
      >
        <img
          src={image[0]}
          alt={name}
          className="w-full h-auto object-cover transform 
                     group-hover:scale-105 transition-transform duration-300"
        />
        {/* Hover Actions */}
        <div
          className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 
                      group-hover:opacity-100 transition-opacity"
        >
          <button
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            title="Add to Wishlist"
          >
            <Heart size={20} className="text-gray-700" />
          </button>
          <button
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            title="Add to Cart"
          >
            <ShoppingCart size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Badge Example */}
        {/* <span
          className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold 
                      py-1 px-3 rounded-full"
        >
          Sale
        </span> */}
      </Link>

      {/* Product Details */}
      <div className="p-4 text-center">
        <Link
          to={`/product/${id}`}
          onClick={handleClick}
          className="block text-lg font-semibold text-gray-800 hover:text-blue-600 truncate"
        >
          {name}
        </Link>

        <p className="text-red-600 mt-2 text-base font-medium">
          {currency} {price}
        </p>

        <Link
          to={`/product/${id}`}
          onClick={handleClick}
          className="mt-4 inline-block text-black text-sm 
                     font-medium px-5 py-2 rounded-full hover:bg-gray-400 
                     transition-all"
        >
          {">>" }
        </Link>
      </div>
    </div>
  );
};

export default ProductItem;

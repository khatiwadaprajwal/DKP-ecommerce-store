import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const CategoriesSection = () => {
  const {
    setCategory,
    setSizes,
    toggleCategory,
    applyFilter,
    category,
    setFilterProducts,
    products,
  } = useContext(ShopContext);
  
  const navigate = useNavigate();

  const categories = [
    {
      name: "Women",
      image: "/api/placeholder/400/600",
      value: "Women", // Match this with your product's category value
      description: "Elegant & Trendy Styles",
      backgroundColor: "bg-pink-50",
      textColor: "text-pink-600",
      borderColor: "border-pink-600",
    },
    {
      name: "Men",
      image: "/api/placeholder/400/600",
      value: "Men",
      description: "Classic & Modern Looks",
      backgroundColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-600",
    },
    {
      name: "Formal Wear",
      image: "/api/placeholder/400/600",
      value: "formal",
      description: "Professional & Sophisticated",
      backgroundColor: "bg-gray-50",
      textColor: "text-gray-600",
      borderColor: "border-gray-600",
    },
    {
      name: "Casual Wear",
      image: "/api/placeholder/400/600",
      value: "casual",
      description: "Comfort Meets Style",
      backgroundColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-600",
    },
  ];

  const handleCategoryClick = (categoryValue) => {
    // Reset previous categories and set the new one
    setCategory([categoryValue]);
    
    // Reset sizes filter
    setSizes([]);
    
    // Apply the filter
    applyFilter();
    
    // Navigate to the collection page
    navigate("/collection");
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(category.value)}
              className={`
                relative group cursor-pointer
                rounded-xl overflow-hidden
                transform transition-all duration-300 hover:scale-105
                shadow-lg hover:shadow-xl
                ${category.backgroundColor}
                h-40 sm:h-48 md:h-52 lg:h-64
                flex items-center justify-center
              `}
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity group-hover:scale-110  duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent`}></div>
              </div>
              
              <div className="relative z-10 text-center p-4">
                <h3 className={`text-white text-xl sm:text-2xl font-bold mb-1`}>
                  {category.name}
                </h3>
                <p className="text-white text-sm sm:text-base opacity-90">
                  {category.description}
                </p>
                <div className="mt-3 sm:mt-4">
                  <span className="inline-block bg-white text-black text-sm font-medium px-4 py-2 rounded-full transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Shop Now
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
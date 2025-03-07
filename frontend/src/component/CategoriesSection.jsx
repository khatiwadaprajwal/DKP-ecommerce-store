import React, { useContext } from 'react';
import { ShopContext } from "../context/Shopcontext";
import { useNavigate } from 'react-router-dom';

const CategoriesSection = () => {
  const { setCategory, toggleCategory, applyFilter } = useContext(ShopContext);
  const navigate = useNavigate();

  const categories = [
    {
      name: "Women",
      image: "/api/placeholder/400/600",
      value: "Women", // Match this with your product's category value
      description: "Elegant & Trendy Styles",
      backgroundColor: "bg-pink-50",
      textColor: "text-pink-600",
      borderColor: "border-pink-600"
    },
    {
      name: "Men",
      image: "/api/placeholder/400/600",
      value: "Men",
      description: "Classic & Modern Looks",
      backgroundColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-600"
    },
    {
      name: "Formal Wear",
      image: "/api/placeholder/400/600",
      value: "formal",
      description: "Professional & Sophisticated",
      backgroundColor: "bg-gray-50",
      textColor: "text-gray-600",
      borderColor: "border-gray-600"
    },
    {
      name: "Casual Wear",
      image: "/api/placeholder/400/600",
      value: "casual",
      description: "Comfort Meets Style",
      backgroundColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-600"
    }
  ];


  
  const handleCategoryClick = (categoryValue) => {
    navigate('/collection');
    toggleCategory([categoryValue]); // ✅ Reset the category filter with selected category
    applyFilter();
     // ✅ Navigate to the collection page
  };

  return (
    <section className="container mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-center mb-12">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 justify-items-center">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category.value)}
            className={`
              relative group
              w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64
              rounded-full overflow-hidden
              transform transition-all duration-300 hover:scale-105
              ${category.backgroundColor}
              shadow-lg hover:shadow-2xl
              flex items-center justify-center
            `}
          >
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover
                           transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gray-800 bg-opacity-30
                             flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 text-white">
                <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-center mb-1 md:mb-2 ${category.textColor}`}>{category.name}</h3>
                <p className="opacity-80 text-center text-xs sm:text-sm md:text-base mb-2 md:mb-4">{category.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;

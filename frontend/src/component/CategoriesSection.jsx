import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Coffee, Shirt } from "lucide-react";

const CategoriesSection = () => {
  const {
    setCategory,
    applyFilter,
    resetAllFilters,
  } = useContext(ShopContext);
  
  const navigate = useNavigate();
  
  // Track hover state for animation
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const categories = [
    {
      name: "Formal Wear",
      headline: "Discover Elegant Formal Wear That",
      subheadline: "Defines Sophistication and Style",
      icon: <ShoppingBag size={32} />,
      description: "Elevate your wardrobe with our sophisticated formal attire.",
      cta: "Shop",
      image: "/api/placeholder/400/600",
      categoryValue: "Formal",
    },
    {
      name: "Casual Wear",
      headline: "Unwind in Our Trendy Casual Wear",
      subheadline: "for Everyday Adventures",
      icon: <Coffee size={32} />,
      description: "Casual wear that combines style with unparalleled comfort.",
      cta: "Browse",
      image: "/api/placeholder/400/600",
      categoryValue: "Casual",
    },
    {
      name: "Ethnic Wear",
      headline: "Embrace Tradition with Our",
      subheadline: "Beautifully Crafted Ethnic Wear Collection",
      icon: <Shirt size={32} />,
      description: "Celebrate culture with our stunning ethnic outfits for all occasions.",
      cta: "Explore",
      image: "/api/placeholder/400/600",
      categoryValue: "Ethnic",
    },
  ];
  
  const handleCategoryClick = (category) => {
    resetAllFilters();
    
    if (category.categoryValue) {
      setCategory([category.categoryValue]);
    }
    
    applyFilter();
    navigate("/collection");
  };
  
  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main Headline with animation */}
        <div className="mb-12 opacity-0 animate-fade-in-down">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-1">
            Explore Our Exclusive Collection of
          </h2>
          <h3 className="text-xl md:text-2xl font-bold text-center">
            Fashion Wear for Every Occasion
          </h3>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-16">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`flex flex-col p-6 rounded-lg transition-all duration-300 ease-in-out ${
                hoveredIndex === index ? 'bg-gray-50 shadow-lg scale-105' : 'bg-white'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Icon with animation */}
              <div className={`mb-5 p-4 bg-blue-50 rounded-full inline-block transform transition-all duration-300 ${
                hoveredIndex === index ? 'scale-110 text-blue-600 rotate-6' : ''
              }`}>
                {React.cloneElement(category.icon, { 
                  color: hoveredIndex === index ? "#2563EB" : "#4B5563",
                  strokeWidth: 1.5
                })}
              </div>
              
              {/* Category Title */}
              <h4 className="text-base font-bold text-left mb-1">
                {category.headline}
              </h4>
              <h5 className="text-base font-bold text-left mb-2">
                {category.subheadline}
              </h5>
              
              {/* Category Description */}
              <p className="text-xs text-left text-gray-700 mb-3">
                {category.description}
              </p>
              
              {/* CTA Button with animation */}
              <button 
                onClick={() => handleCategoryClick(category)}
                className={`flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-auto transition-all duration-300 ${
                  hoveredIndex === index ? 'translate-x-2' : ''
                }`}
              >
                {category.cta}
                <span className={`ml-1 transition-all duration-300 ${
                  hoveredIndex === index ? 'translate-x-1' : ''
                }`}>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default CategoriesSection;
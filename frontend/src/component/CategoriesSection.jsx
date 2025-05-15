import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Smile, 
  Flag 
} from "lucide-react";

const CategoriesSection = () => {
  const {
    setCategory,
    applyFilter,
    resetAllFilters,
  } = useContext(ShopContext);
  
  const navigate = useNavigate();
  
  const categories = [
    {
      name: "Formal Wear",
      description: "Sophisticated attire for the modern professional",
      icon: Briefcase,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
      categoryValue: "Formal",
    },
    {
      name: "Casual Wear",
      description: "Relaxed styles for everyday elegance",
      icon: Smile,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
      categoryValue: "Casual",
    },
    {
      name: "Ethnic Wear",
      description: "Traditional designs with modern sensibilities",
      icon: Flag,
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
      categoryValue: "Ethnic",
    }
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
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Discover Your Perfect Style
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections that cater to every mood, occasion, and personal expression
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            
            return (
              <div 
                key={index}
                onClick={() => handleCategoryClick(category)}
                className={`
                  ${category.bgColor} ${category.borderColor}
                  border rounded-3xl p-6
                  flex flex-col items-start
                  transition-all duration-300
                  hover:shadow-lg cursor-pointer
                  group
                  relative
                  overflow-hidden
                `}
              >
                {/* Background Overlay */}
                <div className={`
                  absolute inset-0 
                  opacity-5 group-hover:opacity-10
                  transition-opacity duration-300
                  ${category.bgColor}
                `}></div>
                
                {/* Icon */}
                <div className={`
                  mb-4 w-16 h-16 rounded-full 
                  flex items-center justify-center
                  bg-white border ${category.borderColor}
                  z-10 relative
                  group-hover:scale-105 transition-transform
                `}>
                  <CategoryIcon 
                    size={32} 
                    className={`${category.textColor}`} 
                    strokeWidth={1.5} 
                  />
                </div>
                
                {/* Category Details */}
                <div className="z-10 relative">
                  <h3 className={`
                    text-xl font-bold mb-2
                    ${category.textColor}
                  `}>
                    {category.name}
                  </h3>
                  
                  <p className={`
                    text-sm mb-4
                    ${category.textColor} text-opacity-80
                  `}>
                    {category.description}
                  </p>
                  
                  {/* CTA */}
                  <div className={`
                    flex items-center ${category.textColor}
                    text-base font-semibold
                    group-hover:translate-x-2 transition-transform
                  `}>
                    Explore Collection
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
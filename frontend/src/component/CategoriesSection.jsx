import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Smile, 
  Flag,
  MoveRight 
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
      description: "Sophisticated attire for the modern professional.",
      icon: Briefcase,
      categoryValue: "Formal",
    },
    {
      name: "Casual Wear",
      description: "Relaxed styles for everyday elegance.",
      icon: Smile,
      categoryValue: "Casual",
    },
    {
      name: "Ethnic Wear",
      description: "Traditional designs with modern sensibilities.",
      icon: Flag,
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 tracking-tight">
            Discover Your Style
          </h2>
          <p className="text-lg text-gray-500 font-light max-w-2xl">
            Curated collections designed for every dimension of your life
          </p>
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            
            return (
              <div 
                key={index}
                onClick={() => handleCategoryClick(category)}
                className={`
                  group relative cursor-pointer
                  bg-gray-50 
                  /* h-auto lets the div shrink to fit text */
                  h-auto
                  flex flex-col
                  p-8 rounded-xl
                  transition-all duration-500 ease-out
                  hover:bg-black hover:shadow-xl
                `}
              >
                {/* Icon */}
                <div className="mb-6">
                  <CategoryIcon 
                    size={60} 
                    strokeWidth={1.5}
                    className="text-gray-900 group-hover:text-white transition-colors duration-500" 
                  />
                </div>
                
                {/* Content */}
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    {category.name}
                  </h3>
                  <p className="text-base text-gray-500 group-hover:text-gray-300 transition-colors duration-500 leading-relaxed">
                    {category.description}
                  </p>
                </div>
                
                {/* Bottom Action Area */}
                <div className="mt-auto pt-6 border-t border-gray-200 group-hover:border-gray-800 transition-colors duration-500 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-900 group-hover:text-white transition-colors duration-500">
                    Explore Collection
                  </span>
                  
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-500">
                    <MoveRight 
                      size={16} 
                      className="transform group-hover:-rotate-45 transition-transform duration-500"
                    />
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
import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Sunset, 
  Sparkles, 
  ArrowUpRight 
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
      id: "01",
      name: "Formal Wear",
      description: "Sharp cuts & premium fabrics.",
      icon: Briefcase,
      categoryValue: "Formal",
    },
    {
      id: "02",
      name: "Casual Wear",
      description: "Effortless everyday comfort.",
      icon: Sunset,
      categoryValue: "Casual",
    },
    {
      id: "03",
      name: "Ethnic Wear",
      description: "Timeless traditional designs.",
      icon: Sparkles,
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex justify-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 text-center leading-tight max-w-2xl">
            Explore our collections 
          </h2>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            
            return (
              <div 
                key={index}
                onClick={() => handleCategoryClick(category)}
                // Reduced height to h-[380px] for a more compact look
                className="group relative h-[380px] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-50 hover:bg-[#111] transition-all duration-700 ease-out"
              >
                {/* 1. BACKGROUND WATERMARK ICON (Larger Size) */}
                {/* Increased size to 500 and adjusted position to dominate the background */}
                <div className="absolute right-[-25%] bottom-[-25%] opacity-[0.05] group-hover:opacity-[0.1] group-hover:scale-105 transition-all duration-700">
                  <CategoryIcon size={500} strokeWidth={0.5} className="text-black group-hover:text-white" />
                </div>

                {/* 2. TOP NUMBERING */}
                <div className="absolute top-6 left-6">
                  <span className="text-xs font-bold tracking-widest text-gray-400 group-hover:text-gray-500 transition-colors duration-500">
                    /{category.id}
                  </span>
                </div>

                {/* 3. CENTER CONTENT */}
                <div className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center z-10">
                  
                  {/* Floating Icon Circle */}
                  <div className="mb-6 p-5 rounded-full bg-white shadow-sm group-hover:bg-white/10 group-hover:backdrop-blur-sm transition-all duration-500 group-hover:scale-110">
                    <CategoryIcon 
                      size={28} 
                      strokeWidth={1.5}
                      className="text-gray-900 group-hover:text-white transition-colors duration-500" 
                    />
                  </div>

                  <h3 className="text-3xl font-serif text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-500 max-w-[200px] text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
                    {category.description}
                  </p>
                </div>

                {/* 4. BOTTOM ACTION BUTTON */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <span className="inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1">
                    Shop Now <ArrowUpRight size={14} />
                  </span>
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
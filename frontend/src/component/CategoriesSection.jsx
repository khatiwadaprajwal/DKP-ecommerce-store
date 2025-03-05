import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CategoriesSection = () => {
  const categories = [
    { 
      name: "Women", 
      image: "/api/placeholder/400/600", 
      link: "/category/women",
      description: "Elegant & Trendy Styles",
      backgroundColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    { 
      name: "Men", 
      image: "/api/placeholder/400/600", 
      link: "/category/men",
      description: "Classic & Modern Looks",
      backgroundColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      name: "Formal Wear", 
      image: "/api/placeholder/400/600", 
      link: "/category/formal",
      description: "Professional & Sophisticated",
      backgroundColor: "bg-gray-50",
      textColor: "text-gray-600"
    },
    { 
      name: "Casual Wear", 
      image: "/api/placeholder/400/600", 
      link: "/category/casual",
      description: "Comfort Meets Style",
      backgroundColor: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  return (
    <section className="container mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-center mb-12">Shop by Category</h2>
      <div className="grid md:grid-cols-4 gap-8">
        {categories.map((category, index) => (
          <Link 
            key={index} 
            to={category.link} 
            className={`
              relative group overflow-hidden rounded-2xl shadow-lg 
              transform transition-all duration-300 hover:-translate-y-4
              ${category.backgroundColor} hover:shadow-2xl
            `}
          >
            <div className="relative pt-[120%] overflow-hidden">
              <img 
                src={category.image} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover 
                           transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 
                              flex flex-col justify-end p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="opacity-80 mb-4">{category.description}</p>
                  </div>
                  <div className={`
                    rounded-full p-2 bg-white bg-opacity-20 
                    group-hover:bg-opacity-40 transition-all duration-300
                    ${category.textColor}
                  `}>
                    <ArrowRight size={24} />
                  </div>
                </div>
              </div>
            </div>
            <div className={`
              absolute bottom-0 left-0 right-0 h-1 
              ${category.textColor} 
              transform origin-left scale-x-0 
              group-hover:scale-x-100 
              transition-transform duration-300
            `}></div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
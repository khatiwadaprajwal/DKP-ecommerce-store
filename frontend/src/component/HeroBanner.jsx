import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);


  
  const slides = [
    {
      image: "/api/placeholder/1200/600",
      title: "Spring Collection 2025",
      subtitle: "Embrace the season with vibrant styles",
      cta: "Shop Now"
    },
    {
      image: "/api/placeholder/1200/600",
      title: "Summer Essentials",
      subtitle: "Stay cool with our lightweight fabrics",
      cta: "Discover More"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative group">
      <div className="relative  h-[500px] md:h-[700px] overflow-hidden">
        <img 
          src={slides[currentSlide].image} 
          alt="Fashion banner" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center max-w-2xl px-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              {slides[currentSlide].title}
            </h2>
            <p className="text-xl md:text-2xl text-white mb-10 opacity-80">
              {slides[currentSlide].subtitle}
            </p>
            <Link 
              to="/collection" 
              className="px-10 py-4 bg-white text-gray-900 font-semibold rounded-full 
                         hover:bg-gray-100 transition-all duration-300 
                         transform hover:scale-105 shadow-lg"
            >
              {slides[currentSlide].cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute top-1/2 w-full flex justify-between px-4 transform -translate-y-1/2">
        <button 
          onClick={prevSlide} 
          className="bg-white/50 hover:bg-white/75 rounded-full p-3 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide} 
          className="bg-white/50 hover:bg-white/75 rounded-full p-3 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default HeroBanner;
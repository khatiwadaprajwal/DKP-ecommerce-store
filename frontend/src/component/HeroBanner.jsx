import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = [
    {
      // Replace these URLs with your actual image URLs after downloading them
      image: "/api/placeholder/1200/600",
      title: "Spring Collection 2025",
      subtitle: "Embrace the season with vibrant styles",
      cta: "Shop Now",
      position: "center", // Image positioning
      overlay: "bg-black", // Overlay opacity
    },
    {
      image: assets.slide2,
      title: "Festival Collection",
      subtitle: "Joyful Styles for Every Celebration",
      cta: "Discover More",
      position: "center",
      // overlay: "bg-black",
    },
  ];

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="relative group h-[400px] md:h-[660px] overflow-hidden">
      {/* Slide transition */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out
            ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={`Fashion banner ${index + 1}`}
              className={`w-full h-full object-cover object-${slide.position} transition-transform duration-700 
                ${index === currentSlide ? "scale-105" : "scale-100"}`}
            />
            <div className={`absolute inset-0 ${slide.overlay}`}></div>
          </div>

          {/* Content */}
          <div className="relative z-20 h-full flex items-center justify-center">
            <div className="text-center max-w-2xl px-4">
              <h1 
                className={`font-heading text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight
                  ${index === currentSlide ? "animate-fade-up" : ""}`}
                style={{
                  animation: index === currentSlide ? 'fadeIn 0.8s ease-out, slideUp 0.8s ease-out' : '',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {slide.title}
              </h1>
              <p 
                className={`font-primary text-xl md:text-2xl text-white mb-10 opacity-90 font-light`}
                style={{
                  animation: index === currentSlide ? 'fadeIn 0.8s ease-out 0.3s both, slideUp 0.8s ease-out 0.3s both' : '',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  letterSpacing: '0.5px'
                }}
              >
                {slide.subtitle}
              </p>
              <Link
                to="/collection"
                className="px-10 py-4 bg-white text-gray-900 font-primary font-medium text-base tracking-wide rounded-full
                          hover:bg-gray-100 transition-all duration-300
                          transform hover:scale-105 shadow-lg"
                style={{
                  animation: index === currentSlide ? 'fadeIn 0.8s ease-out 0.6s both, slideUp 0.8s ease-out 0.6s both' : ''
                }}
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Navigation */}
      <div className="absolute top-1/2 w-full flex justify-between px-4 transform -translate-y-1/2 z-30">
        <button
          onClick={prevSlide}
          className="bg-white/30 hover:bg-white/75 rounded-full p-3 transition-all hover:scale-110"
          disabled={isAnimating}
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white/30 hover:bg-white/75 rounded-full p-3 transition-all hover:scale-110"
          disabled={isAnimating}
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 w-full flex justify-center gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentSlide(index);
                setTimeout(() => setIsAnimating(false), 500);
              }
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HeroBanner;
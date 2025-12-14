import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Define slides constant
  const slides = [
    {
      id: 1,
      image: assets.slide1,
      title: "Spring Collection 2025",
      subtitle: "Embrace the season with vibrant styles",
      cta: "Shop Now",
      position: "center",
      overlay: "bg-black/40", // Slightly darker for better text contrast
    },
    {
      id: 2,
      image: assets.slide2,
      title: "Festival Collection",
      subtitle: "Joyful Styles for Every Celebration",
      cta: "Discover More",
      position: "center",
      overlay: "bg-black/40",
    },
  ];

  // Function to handle Next Slide
  const nextSlide = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 500); // Animation duration
    }
  }, [isAnimating, slides.length]);

  // Function to handle Previous Slide
  const prevSlide = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isAnimating, slides.length]);

  // Automatic Slide Timer (5 Seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      // We bypass the isAnimating check for the auto-timer to ensure it never gets stuck,
      // but we still set the animation flag for CSS transitions.
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 500);
    }, 5000);

    // Clear timer if user manually interacts (resets the 5s clock)
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]); // Re-run effect when slide changes

  return (
    <div className="relative group h-[400px] md:h-[660px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out
            ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {/* Image Background */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover object-${slide.position} transition-transform duration-[2000ms] ease-out
                ${index === currentSlide ? "scale-110" : "scale-100"}`}
            />
            <div className={`absolute inset-0 ${slide.overlay}`}></div>
          </div>

          {/* Text Content */}
          <div className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto transform transition-all duration-500">
              <h1 
                className={`font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg
                  ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transition: "all 0.8s ease-out 0.2s" }}
              >
                {slide.title}
              </h1>
              
              <p 
                className={`font-primary text-xl md:text-2xl text-gray-100 mb-10 font-light drop-shadow-md
                  ${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transition: "all 0.8s ease-out 0.4s" }}
              >
                {slide.subtitle}
              </p>
              
              <div 
                className={`${index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transition: "all 0.8s ease-out 0.6s" }}
              >
                <Link
                  to="/collection"
                  className="inline-block px-10 py-4 bg-white text-gray-900 font-primary font-semibold text-base tracking-wide rounded-full
                            hover:bg-gray-100 transition-all duration-300 shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] 
                            hover:scale-105 hover:shadow-[0_6px_20px_rgba(255,255,255,0.23)]"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 text-white backdrop-blur-sm 
                   hover:bg-black/40 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 hidden md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 text-white backdrop-blur-sm 
                   hover:bg-black/40 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 hidden md:block"
        aria-label="Next slide"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAnimating(true);
              setCurrentSlide(index);
              setTimeout(() => setIsAnimating(false), 500);
            }}
            className={`h-2.5 rounded-full transition-all duration-500 shadow-sm ${
              index === currentSlide ? "bg-white w-10" : "bg-white/40 w-2.5 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
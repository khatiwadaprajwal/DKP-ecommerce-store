import React from 'react'
import { ShoppingCart, Heart, Search, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const categories = [
    { name: "Women", image: "/api/placeholder/300/400" },
    { name: "Men", image: "/api/placeholder/300/400" },
    { name: "Accessories", image: "/api/placeholder/300/400" },
    { name: "Footwear", image: "/api/placeholder/300/400" }
  ];

  const popularProducts = [
    { name: "Classic White Tee", price: "$29.99", image: "/api/placeholder/300/400", tag: "New", discount: null },
    { name: "Slim Fit Jeans", price: "$59.99", image: "/api/placeholder/300/400", tag: null, discount: "-20%" },
    { name: "Cotton Blend Sweater", price: "$49.99", image: "/api/placeholder/300/400", tag: null, discount: null },
    { name: "Structured Blazer", price: "$89.99", image: "/api/placeholder/300/400", tag: "Bestseller", discount: null }
  ];

  const bestsellers = [
    { name: "Premium Denim Jacket", price: "$129.99", image: "/api/placeholder/300/400" },
    { name: "Cashmere Scarf", price: "$45.99", image: "/api/placeholder/300/400" },
    { name: "Leather Belt", price: "$39.99", image: "/api/placeholder/300/400" },
    { name: "Everyday Tote Bag", price: "$79.99", image: "/api/placeholder/300/400" }
  ];

  const latestProducts = [
    { name: "Structured Trench Coat", price: "$179.99", image: "/api/placeholder/300/400" },
    { name: "Merino Wool Cardigan", price: "$89.99", image: "/api/placeholder/300/400" },
    { name: "Pleated Midi Skirt", price: "$69.99", image: "/api/placeholder/300/400" },
    { name: "Linen Blend Shirt", price: "$59.99", image: "/api/placeholder/300/400" }
  ];



  return (
    <div className="min-h-screen bg-white">
       {/* Hero Banner */}
       <div className="relative bg-gray-50">
        <div className="relative h-96 md:h-screen max-h-96 md:max-h-96 overflow-hidden">
          <img 
            src={slides[currentSlide].image} 
            alt="Fashion banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center">
            <div className="text-center w-full px-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{slides[currentSlide].title}</h2>
              <p className="text-xl text-white mb-8">{slides[currentSlide].subtitle}</p>
              <a href="#" className="inline-block bg-white text-gray-900 px-8 py-3 font-medium rounded hover:bg-gray-100 transition-colors">
                {slides[currentSlide].cta}
              </a>
            </div>
          </div>
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
            onClick={prevSlide}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
            onClick={nextSlide}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home

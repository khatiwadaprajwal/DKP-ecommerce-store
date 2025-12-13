import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductItem from "../component/ProductItem";
import api from '../config/api'; // ✅ Use centralized API

import 'swiper/css';
import 'swiper/css/navigation';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // ✅ api.get handles BaseURL automatically
        const response = await api.get('/v1/productlist/featured');
        
        // Handle different response structures gracefully
        if (response.data.success && response.data.featuredProducts) {
          setFeaturedProducts(response.data.featuredProducts);
        } else if (Array.isArray(response.data)) {
          setFeaturedProducts(response.data);
        }
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError(err.message || 'Failed to fetch featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading featured items...</div>;
  if (error) return null; // Hide section on error
  if (featuredProducts.length === 0) return null;

  if (loading) {
    return (
      <div className="py-16 container mx-auto px-4">
        <div className="animate-pulse flex flex-col space-y-8">
           <div className="h-8 bg-gray-200 w-1/4 mb-6 rounded"></div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded"></div>)}
           </div>
        </div>
      </div>
    );
  }

  if (error) return null; 
  return (
    <div className="py-12 border-b border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Featured Collection</h2>
          <p className="text-gray-500 text-sm mt-2 font-light tracking-wide">Handpicked favorites just for you</p>
        </div>
        
        <button 
          onClick={() => navigate('/collection')}
          className="group flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors pb-1 border-b border-gray-300 hover:border-gray-900"
        >
          View All
          <svg 
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Slider */}
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={4}
        navigation
        className="pb-8"
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 16 },
          640: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
          1280: { slidesPerView: 5, spaceBetween: 30 },
        }}
      >
        {featuredProducts.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductItem 
              id={product._id}
              image={product.images && product.images.length > 0 ? product.images[0] : ""} 
              name={product.productName}
              price={product.price}
              rating={product.averageRating} 
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedProducts;
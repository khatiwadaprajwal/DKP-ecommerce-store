import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../component/ProductItem";
import axios from 'axios';

import 'swiper/css';
import 'swiper/css/navigation';

const ProductCollection = ({ title, collectionType }) => {
  const { backend_url } = useContext(ShopContext);
  const navigate = useNavigate();
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCollectionProducts = async () => {
      try {
        setLoading(true);
        let endpoint = '';
        
        switch(collectionType) {
          case 'bestseller':
            endpoint = 'bestsellers';
            break;
          case 'topRated':
            endpoint = 'top-rated';
            break;
          case 'latest':
            endpoint = 'latest';
            break;
          default:
            throw new Error('Invalid collection type');
        }

        const response = await axios.get(`${backend_url}/v1/productlist/${endpoint}`);
        console.log("respnse ", response )
        
        if (response.data.success) {
          let products = [];
          switch(collectionType) {
            case 'latest':
              products = response.data.latestProducts;
              break;
            case 'bestseller':
              products = response.data.bestsellers;
              break;
            case 'topRated':
              products = response.data.topRatedProducts;
              break;
            
          }
          setCollectionProducts(products);
        }
      } catch (err) {
        setError(err.message || `Failed to fetch ${collectionType} products`);
        console.error(`Error fetching ${collectionType} products:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionProducts();
  }, [backend_url, collectionType]);
  
  if (loading) {
    return (
      <div className="py-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className=''>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">{title}</h2>
        <button 
          onClick={() => navigate('/collection')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          View More
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={4}
        navigation
        breakpoints={{
          0: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 40,
          },
        }}
      >
        {collectionProducts.map((product) => (
          <SwiperSlide key={product._id} className=''>
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

export default ProductCollection;
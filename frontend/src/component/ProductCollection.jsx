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
          case 'bestseller': endpoint = 'bestsellers'; break;
          case 'topRated': endpoint = 'top-rated'; break;
          case 'latest': endpoint = 'latest'; break;
          default: throw new Error('Invalid collection type');
        }

        const response = await axios.get(`${backend_url}/v1/productlist/${endpoint}`);
        
        if (response.data.success) {
          let products = [];
          switch(collectionType) {
            case 'latest': products = response.data.latestProducts; break;
            case 'bestseller': products = response.data.bestsellers; break;
            case 'topRated': products = response.data.topRatedProducts; break;
            default: break;
          }
          setCollectionProducts(products);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionProducts();
  }, [backend_url, collectionType]);
  
  if (loading) return <div className="h-96 w-full bg-gray-50 animate-pulse rounded-lg my-8"></div>;
  if (error) return null;
  
  return (
    <div className="py-10">
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 capitalize">
          {title}
        </h2>
        <button 
          onClick={() => navigate('/collection')}
          className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1"
        >
          View Collection
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      
      <Swiper
        modules={[Navigation]}
        spaceBetween={24}
        slidesPerView={4}
        navigation
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 16 },
          640: { slidesPerView: 3, spaceBetween: 20 },
          768: { slidesPerView: 4, spaceBetween: 24 },
          1024: { slidesPerView: 5, spaceBetween: 28 },
        }}
      >
        {collectionProducts.map((product) => (
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

export default ProductCollection;
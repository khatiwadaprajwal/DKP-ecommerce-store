import React, { useState, useContext, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../component/ProductItem";
import axios from 'axios';

import 'swiper/css';
import 'swiper/css/navigation';

const ProductCollection = ({ title, collectionType }) => {
  const { backend_url } = useContext(ShopContext);
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
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className=''>
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
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
              image={product.images[0]} 
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
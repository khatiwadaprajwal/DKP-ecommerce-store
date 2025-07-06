import React, { useState, useContext, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../component/ProductItem";
import axios from 'axios';

import 'swiper/css';
import 'swiper/css/navigation';

const FeaturedProducts = () => {
  const { backend_url } = useContext(ShopContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backend_url}/v1/productlist/featured`);
        if (response.data.success) {
          setFeaturedProducts(response.data.featuredProducts);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch featured products');
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [backend_url]);

  if (loading) {
    return (
      <div className="py-4">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <section className="py-4">
      <div className="mx-auto">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <Swiper
          className='h-auto'
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
          {featuredProducts.map((product) => (
            <SwiperSlide key={product._id}>
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
    </section>
  );
};

export default FeaturedProducts;
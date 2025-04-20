import React, { useState, useContext, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../component/ProductItem";

import 'swiper/css';
import 'swiper/css/navigation';

const FeaturedProducts = () => {
  const { products } = useContext(ShopContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  useEffect(() => {
    // Updated to match the new product model structure
    const featured = products
      .filter(product => 
        // Select products that have high ratings, high sales, or premium pricing
        product.averageRating >= 4 ||
        product.totalSold > 50 ||
        product.price > 150
      )
      .sort((a, b) => {
        // Sort by a combination of factors to show the most "featured" items first
        const aScore = (a.averageRating || 0) * 2 + (a.totalSold / 100) + (a.price / 1000);
        const bScore = (b.averageRating || 0) * 2 + (b.totalSold / 100) + (b.price / 1000);
        return bScore - aScore;
      })
      .slice(0, 8);
    
    setFeaturedProducts(featured);
  }, [products]);

  return (
    <section className="py-4">
      <div className=" mx-auto">
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
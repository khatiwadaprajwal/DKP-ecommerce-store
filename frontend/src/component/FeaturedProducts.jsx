import React, { useState, useContext, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ShopContext } from "../context/Shopcontext";
import ProductItem from "../component/ProductItem";

import 'swiper/css';
import 'swiper/css/navigation';

const FeaturedProducts = () => {
  const { products } = useContext(ShopContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const featured = products.filter(product => 
      product.bestseller || 
      product.name.toLowerCase().includes('premium') || 
      product.price > 150
    ).slice(0, 8);

    setFeaturedProducts(featured);
  }, [products]);

  return (
    <section className=" py-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold  mb-8">Featured Products</h2>
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
                image={product.image[0]}
                name={product.name}
                price={product.price}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturedProducts;
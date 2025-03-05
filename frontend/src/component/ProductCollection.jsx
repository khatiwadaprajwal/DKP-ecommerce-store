import React, { useState, useContext, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ShopContext } from "../context/Shopcontext";
import ProductItem from "../component/ProductItem";

import 'swiper/css';
import 'swiper/css/navigation';

const ProductCollection = ({ title, collectionType }) => {
  const { products } = useContext(ShopContext);
  const [collectionProducts, setCollectionProducts] = useState([]);

  useEffect(() => {
    let filteredProducts = [];

    switch(collectionType) {
      case 'bestseller':
        filteredProducts = products.filter(product => product.bestseller).slice(0, 8);
        break;
      case 'topRated':
        filteredProducts = products.filter(product => product.rating >= 4.5).slice(0, 8);
        break;
      case 'latest':
        filteredProducts = products
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8);
        break;
      default:
        filteredProducts = [];
    }

    setCollectionProducts(filteredProducts);
  }, [products, collectionType]);

  return (
    <div className='px-2 py-4 '>
      <h3 className="text-3xl font-bold mb-8 text-center">{title}</h3>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={4}
        navigation
        breakpoints={{
            0: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 40,
              },
        }}
      >
        {collectionProducts.map((product) => (
          <SwiperSlide key={product._id} className=''>
            
            <ProductItem
              id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductCollection;
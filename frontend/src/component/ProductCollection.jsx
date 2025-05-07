import React, { useState, useContext, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ShopContext } from "../context/ShopContext";
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
        // Use totalSold to determine bestsellers
        filteredProducts = products
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 8);
        break;
      case 'topRated':
        // Use averageRating from the model
        filteredProducts = products
          .filter(product => product.averageRating >= 4.5)
          .slice(0, 8);
        break;
      case 'latest':
        // Use createdAt from timestamps
        filteredProducts = products
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8);
        break;
      case 'popular':
        // New collection type based on combination of rating and sales
        filteredProducts = products
          .sort((a, b) => {
            const aPopularity = (a.averageRating || 0) * (a.totalSold || 0);
            const bPopularity = (b.averageRating || 0) * (b.totalSold || 0);
            return bPopularity - aPopularity;
          })
          .slice(0, 8);
        break;
      case 'trending':
        // Assuming trending is based on recent sales
        filteredProducts = products
          .filter(product => product.totalSold > 20)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 8);
        break;
      default:
        filteredProducts = [];
    }
    
    setCollectionProducts(filteredProducts);
  }, [products, collectionType]);
  
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
              rating={product.averageRating} // Added rating
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductCollection;
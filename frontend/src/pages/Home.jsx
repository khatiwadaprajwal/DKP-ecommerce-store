import React from "react";
import HeroBanner from "../component/HeroBanner";
import FeaturedProducts from "../component/FeaturedProducts";
import ProductCollection from "../component/ProductCollection";
import CategoriesSection from "../component/CategoriesSection";
import Newsletter from "../component/Newsletter";
import ServiceSection from "../component/ServiceSection";
// import HeroBanner from './component/HeroBanner';
// import FeaturedProducts from './component/FeaturedProducts';
// import ProductCollection from './component/ProductCollection';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroBanner />
      <CategoriesSection />
      <FeaturedProducts />
      <div className="container mx-auto py-16 px-2">
        <div className="flex flex-col gap-y-6 gap-x-3 mx-2 my-2">
          <ProductCollection title="Bestsellers" collectionType="bestseller" />
          <ProductCollection title="Top Rated" collectionType="topRated" />
          <ProductCollection
            title="Latest Collection"
            collectionType="latest"
          />
        </div>
      </div>
      <Newsletter/>
     <ServiceSection/>
    </div>
  );
};

export default Home;

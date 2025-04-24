import React from "react";
import HeroBanner from "../component/HeroBanner";
import FeaturedProducts from "../component/FeaturedProducts";
import ProductCollection from "../component/ProductCollection";
import CategoriesSection from "../component/CategoriesSection";
import BenefitsSection from "../component/BenefitsSection";
import Newsletter from "../component/Newsletter";
import ServiceSection from "../component/ServiceSection";

// Import font CSS in your main index.js or App.js
// This comment is just for reference - don't add it to the component directly

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-primary">
      {/* Font styles loaded in head */}
      {/* <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        :root {
          --font-primary: 'Poppins', sans-serif;
          --font-heading: 'Playfair Display', serif;
          --font-body: 'Montserrat', sans-serif;
        }
        
        body {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.6;
          color: #333;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
          font-weight: 600;
          line-height: 1.2;
        }
        
        .font-primary {
          font-family: var(--font-primary);
        }
        
        .font-heading {
          font-family: var(--font-heading);
        }
        
        .font-body {
          font-family: var(--font-body);
        }
      `}</style> */}

      {/* Full width HeroBanner */}
      <div className="w-full">
        <HeroBanner />
      </div>
      
      {/* Container for the rest of the content */}
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <CategoriesSection />
        <FeaturedProducts />
        
        {/* Add the Benefits Section here */}
        <BenefitsSection />
        
        <div className="py-16">
          <div className="flex flex-col gap-y-6 gap-x-3 mx-2 my-2">
            <ProductCollection title="Bestsellers" collectionType="bestseller" />
            <ProductCollection title="Top Rated" collectionType="topRated" />
            <ProductCollection
              title="Latest Collection"
              collectionType="latest"
            />
          </div>
        </div>
        <Newsletter />
        <ServiceSection />
      </div>
    </div>
  );
};

export default Home;
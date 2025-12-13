import React from 'react';
import { Truck, RefreshCw, Shield, Star } from 'lucide-react';

const ServiceSection = () => {
  const services = [
    {
      icon: Truck,
      title: "Free Shipping",
      subtitle: "On all orders over $100"
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      subtitle: "30-day hassle-free return policy"
    },
    {
      icon: Shield,
      title: "Secure Payment",
      subtitle: "100% encrypted checkout"
    },
    {
      icon: Star,
      title: "Quality Guarantee",
      subtitle: "Hand-picked premium products"
    }
  ];

  return (
    <div className="w-full bg-white border-t border-gray-100 py-16 mt-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {services.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group cursor-default">
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-5 group-hover:bg-gray-900 transition-colors duration-300">
                <item.icon 
                  className="text-gray-900 group-hover:text-white transition-colors duration-300" 
                  size={24} 
                  strokeWidth={1.5} 
                />
              </div>
              
              {/* Text */}
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 font-light">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServiceSection;
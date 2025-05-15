import React from "react";
import { Truck, RefreshCw, Shield } from "lucide-react";

const BenefitsSection = () => {
  const handleNavigateAbout = () => {
    // Placeholder for navigation logic
    console.log('Navigate to About');
  };

  const handleNavigateCollection = () => {
    // Placeholder for navigation logic
    console.log('Navigate to Collection');
  };

  return (
    <section className="w-full py-16 bg-green-50 from-neutral-50 to-neutral-100 border border-neutral-200 mt-10 rounded-lg text-lg relative overflow-hidden">
      {/* Retro Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="retro-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path 
                d="M0 0 L50 50 L100 0 L50 50 Z" 
                fill="none" 
                stroke="#9CA3AF" 
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#retro-pattern)" />
        </svg>
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        {/* Left side with content */}
        <div className="w-full md:w-1/2 px-6 md:px-10 flex flex-col justify-center">
          <p className="text-blue-600 font-medium text-sm mb-2">Quality</p>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Discover the Benefits of<br />
            Shopping with Us
          </h2>
          
          <p className="text-gray-700 mb-6">
            Experience unparalleled convenience with <strong>free shipping on all orders</strong>. 
            Enjoy peace of mind with our hassle-free returns and a quality guarantee 
            on every purchase.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-blue-600" />
              <p className="text-sm">Free shipping on all orders, no minimum required.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <RefreshCw size={20} className="text-blue-600" />
              <p className="text-sm">Easy returns within 30 days for your satisfaction.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-blue-600" />
              <p className="text-sm">Quality guarantee ensures you receive the best products.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleNavigateAbout} 
              className="px-6 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
            >
              Learn more
            </button>
            <button 
              onClick={handleNavigateCollection} 
              className="px-6 py-2 border border-gray-300 rounded text-sm flex items-center hover:bg-gray-50 transition-colors"
            >
              Shop <span className="ml-2">→</span>
            </button>
          </div>
        </div>
        
        {/* Right side with image */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <div className="w-full h-64 md:h-80 bg-neutral-100 rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
            <img 
              src="/api/placeholder/500/600" 
              alt="Stylish Clothing Collection" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
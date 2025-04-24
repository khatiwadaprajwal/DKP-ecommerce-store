import React from "react";
import { Truck, RefreshCw, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import {ShopContext} from "../context/ShopContext"

const BenefitsSection = () => {

    const navigate = useNavigate();
  return (
    <section className="w-full py-16 bg-white border border-gray-100 rounded-lg text-lg">
      <div className="flex flex-col md:flex-row gap-8">
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
            <button onClick={()=>navigate("/about")} className="px-6 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
              Learn more
            </button>
            <button onClick={()=>navigate("/collection")} className="px-6 py-2 border border-gray-300 rounded text-sm flex items-center hover:bg-gray-50 transition-colors">
              Shop <span className="ml-2">→</span>
            </button>
          </div>
        </div>
        
        {/* Right side with image */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full h-64 md:h-80 bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
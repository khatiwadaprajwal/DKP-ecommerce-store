import React from "react";
import { useNavigate } from "react-router-dom";
import { Truck, RefreshCw, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const BenefitsSection = () => {
  const navigate = useNavigate();

  const handleNavigateAbout = () => {
    navigate("/about");
  };

  const handleNavigateCollection = () => {
    navigate("/collection");
  };

  const benefits = [
    {
      icon: Truck,
      title: "Global Shipping",
      desc: "Free expedited shipping on all orders."
    },
    {
      icon: RefreshCw,
      title: "30-Day Returns",
      desc: "Hassle-free exchanges and returns."
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      desc: "Bank-level encryption & quality guarantee."
    }
  ];

  return (
    <section className="relative w-full py-20 bg-white overflow-hidden">
      
      {/* Soft Ambient Background (Cleaner & clearer than the grid) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-100/80 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* --- Left Column: Content --- */}
          <div className="w-full lg:w-1/2 pt-4">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Premium Service
            </div>

            {/* Heading - Changed to Serif to match your Logo/Bestsellers */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 leading-[1.1]">
              Elevate Your <br/>
              <span className="italic text-gray-500">Shopping Journey</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg font-light">
              We merge cutting-edge logistics with timeless style. Enjoy a seamless experience from our digital storefront to your doorstep.
            </p>
            
            {/* Benefits List - Cleaner Look */}
            <div className="space-y-8 mb-10">
              {benefits.map((item, index) => (
                <div key={index} className="flex items-start gap-5 group">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 transition-colors duration-300">
                    <item.icon className="w-5 h-5 text-gray-900 group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleNavigateAbout} 
                className="px-8 py-4 rounded-full border border-gray-200 text-gray-900 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 min-w-[140px]"
              >
                Our Story
              </button>
              
              <button 
                onClick={handleNavigateCollection} 
                className="group relative px-8 py-4 rounded-full bg-gray-900 text-white font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center"
              >
                <span className="relative z-10">Start Shopping</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                
                {/* Button Shine Effect */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </div>
          
          {/* --- Right Column: Image --- */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px]">
              
              {/* Decorative Background Frame */}
              <div className="absolute -inset-4 border border-gray-200 rounded-[2.5rem] rotate-3 transform translate-y-4 -z-10" />
              
              {/* Main Image Container */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-gray-100 aspect-[3/4]">
                <img 
                  // Suggestion: Use a real image URL here when possible
                  src="/api/placeholder/600/800" 
                  alt="Premium Clothing Packaging" 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Gradient for Text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Floating "Verified" Badge inside image */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                      <p className="text-gray-900 font-serif font-bold flex items-center gap-2">
                        Verified Quality
                        <CheckCircle2 size={16} className="text-blue-600" />
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Shield size={20} className="text-gray-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
import React from "react";
import { useNavigate } from "react-router-dom";
import { Truck, RefreshCw, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const BenefitsSection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Truck,
      title: "Global Shipping",
      desc: "Fast delivery to your doorstep."
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      desc: "Hassle-free 30-day exchange policy."
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      desc: "Protected by bank-level security."
    }
  ];

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden my-12">
      
      {/* Abstract Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-50/80 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Content Side */}
          <div className="w-full lg:w-1/2">
            <span className="inline-block py-1 px-3 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wider mb-6">
              Our Promise
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 leading-tight">
              Elevate Your <br/>
              <span className="italic text-gray-500">Everyday Style</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed font-light max-w-lg">
              We merge cutting-edge logistics with timeless fashion. Enjoy a seamless experience from our digital storefront to your wardrobe.
            </p>
            
            <div className="grid gap-8 mb-10">
              {benefits.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="shrink-0 p-3 rounded-xl bg-gray-50 text-gray-900">
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-medium text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate("/about")} 
                className="px-8 py-3.5 rounded-full border border-gray-300 text-gray-900 font-medium hover:bg-gray-50 transition-all duration-300"
              >
                Our Story
              </button>
              
              <button 
                onClick={() => navigate("/collection")} 
                className="group px-8 py-3.5 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 shadow-xl shadow-gray-200"
              >
                Shop Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Image Side */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 border border-gray-200 rounded-[2.5rem] rotate-6 transform translate-y-4 -z-10" />
              
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[3/4]">
                {/* Replaced placeholder with a specific clean fashion image from Unsplash */}
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
                  alt="Premium Clothing" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quality Status</p>
                      <p className="text-gray-900 font-serif font-bold flex items-center gap-1.5 mt-0.5">
                        Verified Authentic
                        <CheckCircle2 size={14} className="text-blue-600 fill-blue-50" />
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Shield size={16} className="text-gray-900" />
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
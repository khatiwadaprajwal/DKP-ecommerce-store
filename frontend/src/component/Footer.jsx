import React from "react";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const handleNavigation = (path) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(path);
  };

  return (
    <footer className="bg-gray-50 text-gray-600 py-10 font-sans border-t border-gray-200">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-serif tracking-wide text-gray-900">DISHYANTA KAPADA PASAL</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Blending contemporary fashion with quality craftsmanship. A unique shopping experience.
            </p>
            <div className="flex space-x-3 pt-2">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  // UPDATED: hover:bg-black to ensure it turns black on interaction
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all duration-300 active:bg-black"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {/* UPDATED: Added hover:text-black and active:text-black */}
              <li><button onClick={() => handleNavigation('/')} className="hover:text-black active:text-black transition-colors">Home</button></li>
              <li><button onClick={() => handleNavigation('/collection')} className="hover:text-black active:text-black transition-colors">All Collections</button></li>
              <li><button onClick={() => handleNavigation('/collection')} className="hover:text-black active:text-black transition-colors">New Arrivals</button></li>
              <li><button onClick={() => handleNavigation('/collection')} className="hover:text-black active:text-black transition-colors">Best Sellers</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">Company</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={() => handleNavigation('/about')} className="hover:text-black active:text-black transition-colors">Our Story</button></li>
              <li><button onClick={() => handleNavigation('/contact')} className="hover:text-black active:text-black transition-colors">Contact Us</button></li>
              <li><button onClick={() => handleNavigation('/privacy')} className="hover:text-black active:text-black transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => handleNavigation('/terms')} className="hover:text-black active:text-black transition-colors">Terms & Conditions</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-900">Get in Touch</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <span>Morang, Nepal</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-gray-400" />
                <span>+977 9815345936</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-gray-400" />
                <span>info@dkpasal.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        

      </div>
    </footer>
  );
};

export default Footer;
import React from "react";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const handleNavigation = (path) => {
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Navigate to the path
    navigate(path);
  };

  return (
    <footer className="bg-gray-800 text-white  text-lg py-10 ">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr] gap-10">
        {/* Brand Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">DISHYANTA KAPADA PASAL</h2>
            <p className="text-gray-300 leading-relaxed">
              Your ultimate destination for stylish and comfortable clothing. 
              We blend contemporary fashion with quality craftsmanship, 
              offering a unique shopping experience that celebrates individual style.
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link 
                to="/" 
                onClick={() => handleNavigation("/")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/collection" 
                onClick={() => handleNavigation("/collection")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Collection
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                onClick={() => handleNavigation("/about")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                onClick={() => handleNavigation("/contact")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Customer Support</h3>
          <ul className="space-y-3">
            <li>
              <Link 
                to="/shipping" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Shipping & Delivery
              </Link>
            </li>
            <li>
              <Link 
                to="/returns"
                onClick={() => handleNavigation("/returns")} 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Returns & Exchanges
              </Link>
            </li>
            <li>
              <Link 
                to="/faq" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link 
                to="/privacy" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-300" />
              <span className="text-gray-300">info@dkpasal.com</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-300" />
              <span className="text-gray-300">+977 9815345936</span>
            </li>
            <li className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-300" />
              <span className="text-gray-300">Morang, Nepal</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 mt-12 py-2 text-center">
        <p className="text-gray-400 text-sm">
          © {currentYear} Dishyanta Kapada Pasal. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
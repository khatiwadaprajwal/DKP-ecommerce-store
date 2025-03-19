import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  Heart,
  LogOut,
} from "lucide-react";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getCartCount, logout, navigate } = useContext(ShopContext);
  const location = useLocation();

  useEffect(() => {
    // Configure smooth scrolling for the entire window
    document.documentElement.style.scrollBehavior = "smooth";
    
    // Cleanup function to reset scroll behavior when component unmounts
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const handleLogout = () => {
    logout(); // Call logout function from context
    navigate("/register"); // Redirect to register or login page
    setIsMenuOpen(false); // Close mobile menu if open
  };

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [location.pathname]);

  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "COLLECTION", path: "/collection" },
    { label: "ORDERS", path: "/order" },
    { label: "ABOUT", path: "/about" },
    { label: "CONTACT", path: "/contact" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
    // You might want to navigate to a search results page or filter products
  };

  // Function to handle smooth scrolling for in-page links
  const handleNavClick = (e, path) => {
    // If it's a hash link (in-page navigation)
    if (path.includes('#') && location.pathname === path.split('#')[0]) {
      e.preventDefault();
      const targetId = path.split('#')[1];
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Close mobile menu regardless of link type
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex flex-col items-center"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });
            setIsMenuOpen(false);
          }}
        >
          <h1 className="text-3xl font-bold tracking-wider">DKP</h1>
          <p className="text-xs text-gray-600 tracking-widest">CLOTHING</p>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => `
                  text-sm font-medium tracking-wider 
                  transition-all duration-300 
                  ${
                    isActive
                      ? "text-black border-b-2 border-black"
                      : "text-gray-600 hover:text-black hover:border-b-2 hover:border-gray-300"
                  }
                `}
                onClick={(e) => handleNavClick(e, link.path)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Icons and Search */}
        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative group">
            <Link
              to="/register"
              className="p-2 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="hidden absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border group-hover:block z-50">
              <div className="py-2">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-4 h-4 mr-2" /> My Profile
                </Link>
                <button 
                onClick={()=>handleLogout()}
                className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative hover:bg-gray-100 p-2 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6">
          <div className="container mx-auto">
            <div className="flex items-center border-b pb-4">
              <Search className="w-6 h-6 text-gray-700 mr-4" />
              <form onSubmit={handleSearch} className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-2xl outline-none"
                />
              </form>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="hover:bg-gray-100 p-2 rounded-full"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Recent Searches or Suggested Products */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Sneakers",
                  "Casual Wear",
                  "Running Shoes",
                  "Formal Shoes",
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch({ preventDefault: () => {} });
                    }}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-0 z-40 md:hidden transition-all duration-300 ease-in-out"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-3/4 bg-gray-200 shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center text-gray-700 hover:bg-gray-100 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
                <span className="ml-2 text-sm">Close</span>
              </button>
            </div>
            <div className="py-6 px-4">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className={({ isActive }) => `
                      text-base font-medium text-gray-700 
                      py-3 px-4 rounded-md 
                      transition-colors duration-200
                      ${isActive ? "text-red-500" : "hover:bg-gray-100"}
                    `}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* Additional Mobile Menu Options */}
              <div className="mt-6 border-t pt-4">
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md"
                  >
                    <User className="w-5 h-5 mr-3" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                    }}
                    className="w-full flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md text-left"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
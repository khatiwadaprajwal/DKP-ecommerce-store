import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  Heart,
  LogOut,
  LogIn,
  Package,
  ChevronDown,
} from "lucide-react";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("SELECT CATEGORY");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { 
    getCartCount, 
    token, 
    logout, 
    user, 
    search, 
    setSearch, 
    showSearch, 
    handleSearchFunction 
  } = useContext(ShopContext);
  const location = useLocation();
  const profileDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Available categories for the dropdown
  const categories = [
    "SELECT CATEGORY",
    "Men's Clothing",
    "Women's Clothing",
    "Accessories",
    "Footwear",
    "Sale Items"
  ];

  // Handle clicks outside of the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Configure smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"; 
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // Close search when route changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Handle logout function
  const handleLogout = () => {
    logout(); // Call logout function from context
    setIsMenuOpen(false);
    setIsProfileOpen(false);
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
    { label: "ABOUT", path: "/about" },
    { label: "CONTACT", path: "/contact" },
  ];

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    handleSearchFunction(searchQuery);
    setIsSearchOpen(false);
  };

  // Handle smooth scrolling for in-page links
  const handleNavClick = (e, path) => {
    if (path.includes('#') && location.pathname === path.split('#')[0]) {
      e.preventDefault();
      const targetId = path.split('#')[1];
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    setIsMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-50 shadow-md">
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
          <h1 className="text-3xl font-bold tracking-wider text-gray-800">DKP</h1>
          <p className="text-xs text-gray-600 font-bold tracking-widest">CLOTHING</p>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => `
                  text-sm font-bold tracking-wider 
                  transition-all duration-300 
                  ${
                    isActive
                      ? "text-gray-900 border-b-2 border-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300"
                  }
                `}
                onClick={(e) => handleNavClick(e, link.path)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Search Bar with Category Dropdown - Visible on desktop */}
        <div className="hidden md:flex items-center flex-1 mx-4 max-w-xl">
          <form onSubmit={handleSearch} className="w-full flex">
            {/* Left input field */}
            <input
              type="text"
              placeholder="Search for products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow py-3 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm text-gray-800 font-medium bg-white"
            />
            
            {/* Right search button */}
            <button 
              type="submit" 
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-r-md transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          {/* Search Icon for Mobile */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button 
              onClick={toggleProfileDropdown}
              className="hover:bg-gray-100 p-2.5 rounded-full transition-colors relative"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <User className="w-6 h-6 text-gray-800" />
            </button>
            
            {/* Improved Dropdown with Animation */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-50 transition-all duration-200 ease-in-out transform origin-top-right">
                <div className="py-2 rounded-md ring-1 ring-black ring-opacity-5">
                  {token ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">My Profile</p>
                          <p className="text-xs text-gray-500">View your account details</p>
                        </div>
                      </Link>
                      <Link
                        to="/order"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">My Orders</p>
                          <p className="text-xs text-gray-500">Track your order history</p>
                        </div>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Heart className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">Wishlist</p>
                          <p className="text-xs text-gray-500">Your saved items</p>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">Logout</p>
                          <p className="text-xs text-gray-500">Sign out of your account</p>
                        </div>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LogIn className="w-5 h-5 mr-3 text-gray-600" />
                      <div>
                        <p className="font-medium">Login / Register</p>
                        <p className="text-xs text-gray-500">Access your account</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative hover:bg-gray-100 p-2.5 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-gray-800" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar - toggleable with new design */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-4 pt-1 animate-fadeIn">
          <form onSubmit={handleSearch} className="flex flex-col space-y-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-4 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm text-gray-800 font-medium"
            />
            
            <div className="flex">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-grow py-2 px-4 rounded-l-md bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm text-gray-800 font-medium"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <button 
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-r-md transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-all duration-300 ease-in-out"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-3/4 bg-white shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-medium text-lg text-gray-800">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:bg-gray-100 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="py-6 px-4">
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className={({ isActive }) => `
                      text-base font-medium
                      py-3 px-4 rounded-md 
                      transition-colors duration-200
                      ${isActive ? "text-gray-900 bg-gray-100" : "text-gray-700 hover:bg-gray-50"}
                    `}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* User Related Options in Mobile Menu */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="space-y-1">
                  {token ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md"
                      >
                        <User className="w-5 h-5 mr-3 text-gray-600" />
                        My Profile
                      </Link>
                      <Link
                        to="/order"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md"
                      >
                        <Package className="w-5 h-5 mr-3 text-gray-600" />
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md"
                      >
                        <Heart className="w-5 h-5 mr-3 text-gray-600" />
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md text-left"
                      >
                        <LogOut className="w-5 h-5 mr-3 text-gray-600" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md"
                    >
                      <LogIn className="w-5 h-5 mr-3 text-gray-600" />
                      Login/Register
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add these custom animations to your global CSS or style tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-in-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
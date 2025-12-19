import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  LogIn,
  Package,
  ChevronDown,
  Settings,
  ShieldCheck 
} from "lucide-react";

// ✅ Import useAuth for Authentication Logic
import { useAuth } from "../context/AuthProvider";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("SELECT CATEGORY");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userInitials, setUserInitials] = useState(""); 
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ 1. Get Auth Data & Logout function from useAuth
  const { logout, user, token } = useAuth();

  // ✅ 2. Get Shop Data from ShopContext
  const {
    getCartCount,
    handleSearchFunction,
    navigate,
    setGender,
    applyFilter,
    resetAllFilters
  } = useContext(ShopContext);

  const location = useLocation();
  const profileDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const categories = ["SELECT CATEGORY", "Men", "Women", "Kids"];

  // ✅ 3. Update User Initials & Admin Status based on useAuth data
  useEffect(() => {
    if (token && user) {
      // Determine Name
      const name = user.name || user.firstName || "User";
      
      // Set Initials
      if (name) {
        const initials = name.charAt(0).toUpperCase();
        setUserInitials(initials);
      }

      // Check Admin Role
      const role = user.role || "";
      setIsAdmin(role === "Admin" || role === "SuperAdmin" || role === "admin" || role === "superadmin");
    } else {
      setUserInitials("");
      setIsAdmin(false);
    }
  }, [token, user]);

  // Handle clicks outside
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

  // Focus search input
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // Close search on route change
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  // ✅ 4. Fixed Logout Function
  const handleLogout = async () => {
    await logout(); // Calls the function from AuthProvider
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setUserInitials(""); 
    setIsAdmin(false); 
    navigate("/login");
  };

  // Scroll to top
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "COLLECTION", path: "/collection" },
    { label: "ABOUT", path: "/about" },
    { label: "CONTACT", path: "/contact" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    handleSearchFunction(searchQuery);
    setIsSearchOpen(false);
  };

  const handleNavClick = (e, path) => {
    if (path.includes("#") && location.pathname === path.split("#")[0]) {
      e.preventDefault();
      const targetId = path.split("#")[1];
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
    handleGenderSelect(category);
  };

  const getUserInitialsColor = () => {
    if (!userInitials) return "#4F46E5";
    let hash = 0;
    for (let i = 0; i < userInitials.length; i++) {
      hash = userInitials.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 45%)`;
  };

  const getUserDisplayName = () => {
    if (user) {
        return user.name || user.firstName || "User";
    }
    return "User";
  };

  const handleGenderSelect = (category) => {
    if(category && category === "SELECT CATEGORY"){
      setGender([])
      return;
    }
    resetAllFilters();
    if (category && category !== "SELECT CATEGORY") {
      setGender([category]);
    }
    applyFilter();
    navigate("/collection");
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
              behavior: "smooth",
            });
            setIsMenuOpen(false);
          }}
        >
          <h2 className="text-3xl font-bold tracking-wider text-gray-800">
            DKP
          </h2>
          <p className="text-xs text-gray-600 font-bold tracking-widest">
            CLOTHING
          </p>
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
        <div className="hidden md:flex items-center flex-1 mx-4 max-w-2xl">
          <form onSubmit={handleSearch} className="w-full flex">
            {/* Left input field */}
            <input
              type="text"
              placeholder="Search for products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow py-1 px-4 rounded-l-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 text-lg text-gray-800 font-medium bg-white"
            />

            {/* Custom Category Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={toggleCategoryDropdown}
                className="py-1 px-4 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm text-gray-600 font-bold h-full flex items-center justify-between min-w-40"
              >
                <span>{selectedCategory}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {/* Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-50 max-h-60 overflow-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-r-md transition-colors"
            >
              <Search className="w-4 h-4 text-2xl" />
            </button>
          </form>
          <div className="flex"></div>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          {/* Search Icon for Mobile */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5 text-gray-700 text-2xl" />
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative hover:bg-gray-200 p-2.5 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-gray-800 text-2xl" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className="hover:bg-gray-100  rounded-full transition-colors relative"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              {token && userInitials ? (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-medium text-2xl"
                  style={{ backgroundColor: getUserInitialsColor() }}
                >
                  {userInitials}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200">
                    <User className="w-6 h-6 text-gray-800 text-2xl" />
                </div>
                
              )}
            </button>

            {/* Improved Dropdown with Animation */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-50 transition-all duration-200 ease-in-out transform origin-top-right">
                <div className="py-2 rounded-md ring-1 ring-black ring-opacity-5">
                  {token ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="text-lg">My Profile</p>
                        </div>
                      </Link>
                      <Link
                        to="/order"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="text-lg">My Orders</p>
                        </div>
                      </Link>

                      {/* ✅ NEW: Account Security Link */}
                      <Link
                        to="/security-settings"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShieldCheck className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="text-lg">Account Security</p>
                        </div>
                      </Link>

                      {/* Admin Panel link - only visible for admin users */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="w-5 h-5 mr-3 text-gray-600" />
                          <div>
                            <p className="text-lg">Admin Panel</p>
                          </div>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <p className="text-lg font-bold">Logout</p>
                        </div>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LogIn className="w-7 h-7 mr-3 text-gray-900" />
                      <div>
                        <p className="text-lg font-semibold">Login/Register</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
            className="md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 text-3xl" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 text-2xl" />
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
              {/* Mobile Custom Category Dropdown */}
              <div className="relative flex-grow" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={toggleCategoryDropdown}
                  className="w-full flex justify-between items-center py-2 px-4 rounded-l-md bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm text-gray-800 font-medium"
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>

                {/* Mobile Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-50 max-h-60 overflow-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-r-md transition-colors"
              >
                <Search className="w-4 h-4 text-2xl" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-40 z-40 md:hidden transition-all duration-300 ease-in-out"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-2/3 bg-gray-100 shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out animate-slideIn"
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
                      ${
                        isActive
                          ? "text-gray-900 bg-gray-100"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* User Information Display in Mobile Menu */}
              {token && userInitials && (
                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-base"
                    style={{ backgroundColor: getUserInitialsColor() }}
                  >
                    {userInitials}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">Welcome back!</p>
                  </div>
                </div>
              )}

              {/* User Related Options in Mobile Menu */}
              <div
                className={`${
                  token && userInitials
                    ? "mt-4"
                    : "mt-6 border-t border-gray-100 pt-4"
                }`}
              >
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

                      {/* ✅ NEW: Account Security Link (Mobile) */}
                      <Link
                        to="/security-settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md"
                      >
                        <ShieldCheck className="w-5 h-5 mr-3 text-gray-600" />
                        Account Security
                      </Link>

                      {/* Admin Panel link - only visible for admin users in mobile menu */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center text-base font-medium text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-md"
                        >
                          <Settings className="w-5 h-5 mr-3 text-gray-600" />
                          Admin Panel
                        </Link>
                      )}

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

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-in-out; }
      `}</style>
    </nav>
  );
};

export default Navbar;
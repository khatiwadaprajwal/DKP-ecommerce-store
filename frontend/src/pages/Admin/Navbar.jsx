import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  PlusCircleIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
  EyeIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon // ✅ Added Icon for Messages
} from '@heroicons/react/24/outline';
import { useAuth } from "../../context/AuthProvider"; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ✅ ADDED 'Messages' to this list so it appears in the Mobile Menu
  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: HomeIcon },
    { path: '/admin/listProducts', name: 'Products', icon: ShoppingBagIcon },
    { path: '/admin/ordersList', name: 'Orders', icon: ShoppingCartIcon },
    { path: '/admin/listUsers', name: 'Users', icon: UserGroupIcon },
    { path: '/admin/message', name: 'Messages', icon: ChatBubbleLeftRightIcon }, // 👈 Added this line
    { path: '/admin/addProduct', name: 'Add Product', icon: PlusCircleIcon },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-30 w-full border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. LEFT SIDE: Toggle + Logo */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none md:hidden"
            >
              <Bars3Icon className="block h-6 w-6" />
            </button>

            {/* Brand Logo - Laptop View */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-auto px-3 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                DKP
              </div>
              <span className="font-bold text-3xl text-gray-800 tracking-tight">ADMIN</span>
            </div>
          </div>

          {/* 2. RIGHT SIDE: Actions (User View + Logout) */}
          <div className="hidden md:flex items-center space-x-4">
            
             {/* User View Option */}
             <Link 
               to="/" 
               className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition px-3 py-2 rounded-md hover:bg-gray-50"
             >
                <EyeIcon className="h-5 w-5" /> 
                User View
             </Link> 
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-sm"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

        </div>
      </div>

      {/* =========================================
          MOBILE SLIDE-OUT MENU
         ========================================= */}
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-2">
             <div className="h-9 w-auto px-3 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
               DKP
             </div>
             <span className="text-xl font-bold text-gray-800">Clothing</span>
          </div>

          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full justify-between">
          <div className="px-2 pt-4 pb-3 space-y-1">
            {/* This map function will now include the Messages link */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-6 w-6 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 mb-16">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-md mb-2 transition"
            >
              <EyeIcon className="h-5 w-5 mr-3" />
              User View
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center w-full px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
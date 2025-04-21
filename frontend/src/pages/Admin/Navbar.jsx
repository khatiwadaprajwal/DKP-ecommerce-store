import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, HomeIcon, PlusCircleIcon, ShoppingBagIcon, ShoppingCartIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { ShopContext } from "../../context/ShopContext";


const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const {token , setToken, logout}= useContext(ShopContext);
  
  const handleLogout = () => {
    logout();
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin',
      name: 'Dashboard',
      icon: HomeIcon
    },
    {
      path: '/admin/addProduct',
      name: 'Add Product',
      icon: PlusCircleIcon
    },
    {
      path: '/admin/listProducts',
      name: 'Products',
      icon: ShoppingBagIcon
    },
    {
      path: '/admin/ordersList',
      name: 'Orders',
      icon: ShoppingCartIcon
    },
    {
      path: '/admin/listUsers',
      name: 'Users',
      icon: UserGroupIcon
    }
  ];

  return (
    <header className="bg-white shadow sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setVisible(true)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none md:hidden"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="block h-6 w-6 cursor-pointer sm:hidden" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 ml-2 md:ml-4">Admin Panel</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white text-sm md:text-base rounded hover:bg-red-700 transition duration-200"
        >
          Logout
        </button>
      </div>

      {/* Mobile slide-in menu */}
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 transition-opacity  ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setVisible(false)}
      >
        <div 
          className={`absolute top-0 left-0 bottom-0 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
            visible ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <span className="text-xl font-semibold text-white">DKP Clothing</span>
            <button 
              onClick={() => setVisible(false)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-5 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setVisible(false)}
                  className={`flex items-center space-x-2 py-3 px-4 rounded mb-1 transition duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
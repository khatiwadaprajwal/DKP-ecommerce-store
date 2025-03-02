// File: src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon 
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();

  
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
    }
  ];

  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="flex items-center justify-center space-x-2 px-4">
        <span className="text-xl font-semibold">DKP CLothing</span>
      </div>
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                location.pathname === item.path
                  ? 'bg-gray-700 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

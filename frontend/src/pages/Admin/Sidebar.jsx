import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PlusCircleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
  XMarkIcon,
  UserIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
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
    },
    {
      path: '/admin/listUsers',
      name: 'Users',
      icon: UsersIcon
    },
    {
      path: '/admin/message',
      name: 'Messages',
      icon: ChatBubbleLeftEllipsisIcon
    }
  ];


  
  // Sidebar CSS classes based on open/closed state
  const sidebarClasses = `
    bg-gray-800 text-white w-64 h-full fixed 
    inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static
  `;

  return (
    <>
      {/* Overlay - only show on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-2xl font-semibold">DKP Clothing</span>
          {/* Close button - visible only on mobile */}
          <button 
            onClick={toggleSidebar}
            className="md:hidden text-white hover:text-gray-300 focus:outline-none"
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
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 768) toggleSidebar();
                }}
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
      </aside>
    </>
  );
};

export default Sidebar;
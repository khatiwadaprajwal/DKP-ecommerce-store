import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/solid'; // Using HeroIcon for better consistent UI

const Breadcrumbs = ({ items = [] }) => { // ✅ FIX: Default to empty array
  // Filter out invalid items
  const validItems = items.filter(item => item && item.name);
  
  if (validItems.length === 0) return null;

  return (
    <nav className="text-sm mb-4">
      <ol className="flex items-center flex-wrap gap-2 text-gray-500">
        {validItems.map((item, index) => {
          const isLast = index === validItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
              )}
              
              {isLast || !item.link ? (
                <span className="font-medium text-gray-900 capitalize">
                  {item.name}
                </span>
              ) : (
                <Link 
                  to={item.link} 
                  className="hover:text-indigo-600 transition-colors capitalize"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
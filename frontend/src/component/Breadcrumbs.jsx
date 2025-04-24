import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items }) => {
  // Filter out any empty items
  const validItems = items.filter(item => item.name);
  
  return (
    <nav className="bg-gray-100 py-1 px-4 md:px-6 text-lg">
      <div className="container mx-auto">
        <ol className="flex items-center flex-wrap">
          {validItems.map((item, index) => {
            const isLast = index === validItems.length - 1;
            
            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg 
                    className="mx-2 h-5 w-5 text-gray-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
                
                {isLast || !item.link ? (
                  <span className="text-gray-700 font-medium">{item.name}</span>
                ) : (
                  <Link 
                    to={item.link} 
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
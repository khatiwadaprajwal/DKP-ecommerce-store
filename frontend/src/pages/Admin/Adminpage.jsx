import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Adminpage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-lg">
      {/* Sidebar - always visible on md+ screens */}
      <div className="w-64 hidden md:block fixed inset-y-0 left-0 z-20">
        <Sidebar isOpen={true} toggleSidebar={toggleSidebar} />
      </div>

      {/* For mobile sidebar (optional) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-black bg-opacity-50" onClick={toggleSidebar}>
          <div className="w-64 bg-white h-full">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64">
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {/* Global CSS for responsive font handling */}
      <style jsx global>{`
        /* Base font-size responsive system */
        :root {
          --base-font-size: 12px;
          font-size: var(--base-font-size);
        }
        
        /* Use relative units for text elements */
        h1 { font-size: 2rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.25rem; }
        p, span, a, button, input, select { font-size: 1rem; }
        small { font-size: 0.875rem; }
        
        /* Font-size adjustment for browser settings */
        @media screen and (max-width: 768px) {
          :root {
            --base-font-size: 10px;
          }
        }
        
        /* Container constraints to prevent extreme spreading */
        .container {
          max-width: 100%;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Prevent text from getting too large */
        @media screen and (min-width: 1024px) {
          .container {
            max-width: 1280px;
          }
        }
        
        /* Ensure minimum heights don't break with larger fonts */
        .min-h-100px {
          min-height: 6.25rem; /* 100px in rem */
        }
        
        /* Font size adjust class for components that need special handling */
        .font-size-adjust {
          text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
        
        /* Button and control scaling */
        button, input, select {
          line-height: 1.5;
        }
        
        /* Ensure SVG icons scale with text */
        svg {
          width: 1em;
          height: 1em;
          vertical-align: middle;
        }
      `}</style>
    </div>

    
  );
};

export default Adminpage;

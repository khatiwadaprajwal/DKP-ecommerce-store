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
    <div className="flex min-h-screen bg-gray-100">
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
    </div>
    
  );
};

export default Adminpage;

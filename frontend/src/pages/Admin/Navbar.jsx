import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Handle logout logic here
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;

import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Adminpage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Navbar */}
        <div className="sticky top-0 z-20 bg-white shadow">
          <Navbar />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Adminpage;

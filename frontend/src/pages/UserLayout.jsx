import React from "react";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-size-adjust">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
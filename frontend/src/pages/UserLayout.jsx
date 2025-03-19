import React from "react";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-100px">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default UserLayout;
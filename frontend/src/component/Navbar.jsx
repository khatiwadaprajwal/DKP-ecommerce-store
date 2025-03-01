import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/Shopcontext";


const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const {getCartCount}=useContext(ShopContext);

  return (
    <div className="">
      <div className="flex items-center justify-between py-8 font-medium px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <NavLink to="/">
          <p className="text-5xl item-center justify-between">DKP</p>
          <p className="text-base item-center justify-between align-center ">
            Clothing
          </p>
        </NavLink>

        <ul className="hidden sm:flex gap-10 text-sm text-black ">
          <NavLink to="/" className="flex flex-col items-center gap-1">
            <p className="text-xl hover:bg-black rounded hover:text-white active:bg-black p-2">
              HOME
            </p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>

          <NavLink
            to="/collection"
            className="flex flex-col items-center gap-1"
          >
            <p className="text-xl hover:bg-black rounded hover:text-white active:bg-black p-2">
              COLLECTION
            </p>
            <hr className="w-2/4 border-none h-[1.5px] bg-black hidden" />
          </NavLink>

          <NavLink to="/order" className="flex flex-col items-center gap-1">
            <p className="text-xl hover:bg-black rounded hover:text-white active:bg-black p-2">
              ORDERS
            </p>
            <hr className="w-2/4 border-none h-[1.5px] bg-black hidden" />
          </NavLink>

          <NavLink to="/about" className="flex flex-col items-center gap-1">
            <p className="text-xl hover:bg-black rounded hover:text-white active:bg-black p-2">
              ABOUT
            </p>
            <hr className="w-2/4 border-none h-[1.5px] bg-black hidden" />
          </NavLink>

          <NavLink to="/contact" className="flex flex-col items-center gap-1">
            <p className="text-xl hover:bg-black rounded hover:text-white active:bg-black p-2">
              CONTACT
            </p>
            <hr className="w-2/4 border-none h-[1.5px] bg-black hidden" />
          </NavLink>
        </ul>
        <div className="flex items-center gap-8 ">
  
          <img   src={assets.search_icon} className="w-6 cursor-pointer" alt="" />

          <div className="relative flex items-center gap-8">
            {/* Profile Dropdown */}
            <div className="relative group">
              <Link to="/register">
                <img
                  className="w-6 cursor-pointer "
                  src={assets.profile_icon}
                  alt=""
                />
              </Link>
              <div className=" hidden absolute right-0 pt-4 dropdown-menu shadow-lg bg-white group-hover:block z-10">
                <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                  <p className="cursor-pointer hover:text-black">My Profile</p>
                  <p className="cursor-pointer hover:text-black">Logout</p>
                </div>
              </div>
            </div>

            {/* Cart Icon */}
            <Link to="/cart" className="relative">
              <img src={assets.cart_icon} className="w-6 min-w-5" alt="" />
              <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {getCartCount()}
              </p>
            </Link>
            <img
              onClick={() => setVisible(true)}
              src={assets.menu_icon}
              className="w-6 cursor-pointer sm:hidden"
            />
          </div>

          <div
            className={`absolute top-0 bottom-0 overflow-hidden bg-gray-200 transition-all ${
              visible ? "w-full" : "w-0"
            }`}
          >
            <div className="flex flex-col text-gray-600">
              <div
                onClick={() => setVisible(false)}
                className="flex items-center gap-4 p-3"
              >
                <img className="h-4 rotate-180" src={assets.dropdown_icon} />
              </div>
              <NavLink
                onClick={() => setVisisble(false)}
                className="py-2 pl-6 border-b border-gray-100/80"
                to="/"
              >
                HOME
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border-b border-gray-100/80"
                to="/collection"
              >
                COLLECTION
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border-b border-gray-100/80"
                to="/order"
              >
                ORDER
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border-b border-gray-100/80"
                to="/about"
              >
                ABOUT
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border-b border-gray-100/80"
                to="/contact"
              >
                CONTACT
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

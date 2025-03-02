import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = {
      email,
      password,
    };
    console.log(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner */}
      {/* <div className="bg-black text-white py-2 px-4 text-center text-sm">
        Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{" "}
        <span className="font-semibold">ShopNow</span>
      </div> */}

      

      {/* Login Section */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 bg-blue-50">
          <img 
            src={assets.banner} 
            alt="Shopping Cart with Smartphone" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2">Log in to Exclusive</h1>
            <p className="text-gray-600 mb-8">Enter your details below</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or Phone Number"
                  required
                  className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Log in
                </button>
                <Link to="/forgot-password" className="text-red-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
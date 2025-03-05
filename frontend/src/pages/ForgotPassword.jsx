import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Reset any previous messages
    setMessage("");

    // Basic validation
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    try {
      // Simulated password reset request
      // In a real application, this would be an API call
      console.log("Password reset requested for:", email);
      
      // Set success message
      setMessage("Password reset link has been sent to your email. Please check your inbox.");
    } catch (error) {
      // Handle potential errors
      setMessage("Failed to send password reset link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
        
        {/* Right Side - Forgot Password Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
            <p className="text-gray-600 mb-8">
              Enter the email address associated with your account
            </p>

            {message && (
              <div className={`
                mb-6 p-4 rounded-md text-center
                ${message.includes("sent") 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"}
              `}>
                {message}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                />
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Send Reset Link
                </button>
                
                <Link 
                  to="/login" 
                  className="text-center text-blue-600 hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
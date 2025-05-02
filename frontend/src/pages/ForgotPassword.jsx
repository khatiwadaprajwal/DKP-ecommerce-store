import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {

  const {backend_url} = useContext(ShopContext);
  // Define states for multi-step process
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification, 3: New password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  
  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    // Reset any previous messages
    setMessage("");
    
    // Basic validation
    if (!email) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }
    


    try {
      // Call the sendotp API endpoint
      const response = await fetch("http://localhost:3001/v1/sendotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.status == 201 ) {
        setMessage("OTP sent to your email. Please check your inbox.");
        setMessageType("success");
        setStep(2); // Move to OTP verification step
      } else {
        setMessage(data.error || "Failed to send OTP. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setMessageType("error");
    }
  };

  // Step 2: Verify OTP and set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Reset any previous messages
    setMessage("");
    
    // Basic validation
    if (!otp) {
      setMessage("Please enter the OTP sent to your email");
      setMessageType("error");
      return;
    }
    
    if (!password) {
      setMessage("Please enter a new password");
      setMessageType("error");
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }
    
    try {
      // Call the resetpassword API endpoint
      const response = await fetch("http://localhost:3001/v1/resetpassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, password }),
      });
      
      const data = await response.json();
      
      if (response.status == 200 ) {
        setMessage("Password reset successfully. You can now login with your new password.");
        setMessageType("success");
        setStep(3); // Move to completion step
      } else {
        setMessage(data.message || "Failed to reset password. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setMessageType("error");
    }
  };

  // The Banner Component for Left Side
  const LeftBanner = () => (
    <div className="hidden md:block md:w-1/2 bg-blue-50">
      <img
        src={assets.banner}
        alt="Shopping Cart with Smartphone"
        className="w-full h-full object-cover"
      />
    </div>
  );

  // Message Component
  const MessageAlert = ({ message, type }) => (
    message && (
      <div className={`
        mb-6 p-4 rounded-md text-center
        ${type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
      `}>
        {message}
      </div>
    )
  );

  // Step 1: Email Form
  const EmailForm = () => (
    <form onSubmit={handleRequestOTP} className="space-y-6">
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
          Send OTP
        </button>
        
        <Link
          to="/login"
          className="text-center text-blue-600 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );

  // Step 2: OTP and New Password Form
  const OtpPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <input
          type="text"
          name="otp"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP from email"
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
          placeholder="Enter new password"
          required
          className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
        />
      </div>
      
      <div>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
        />
      </div>
      
      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Reset Password
        </button>
        
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-center text-blue-600 hover:underline"
        >
          Back to Email Entry
        </button>
      </div>
    </form>
  );

  // Step 3: Success and Login Link
  const SuccessView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <svg 
          className="mx-auto h-16 w-16 text-green-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
        <p className="mt-4 text-lg">Password has been reset successfully!</p>
      </div>
      
      <div className="flex flex-col space-y-4">
        <Link
          to="/login"
          className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-center"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side - Image */}
        <LeftBanner />
        
        {/* Right Side - Forms */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify & Reset"}
              {step === 3 && "Password Reset Complete"}
            </h1>
            
            <p className="text-gray-600 mb-8">
              {step === 1 && "Enter the email address associated with your account"}
              {step === 2 && "Enter the OTP sent to your email and set a new password"}
              {step === 3 && "Your password has been updated successfully"}
            </p>
            
            <MessageAlert message={message} type={messageType} />
            
            {step === 1 && <EmailForm />}
            {step === 2 && <OtpPasswordForm />}
            {step === 3 && <SuccessView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
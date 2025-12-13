import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import api from "../config/api"; 
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Define states
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Refs for focus management
  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);

  // --- HANDLERS ---

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email) return toast.error("Please enter your email address");
    
    setIsLoading(true);
    try {
      const response = await api.post("/v1/sendotp", { email });
      if (response.status === 201 || response.status === 200) {
        toast.success("OTP sent to your email!");
        setStep(2); 
        // Focus OTP field after render
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify & Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!otp) return toast.error("Enter OTP");
    if (!password) return toast.error("Enter new password");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    
    setIsLoading(true);
    try {
      const response = await api.put("/v1/resetpassword", { email, otp, password });
      
      if (response.status === 200) {
        toast.success("Password reset successfully!");
        setStep(3);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const LeftBanner = (
    <div className="hidden md:block md:w-1/2 bg-blue-50">
      <img
        src={assets.loginbanner || "https://via.placeholder.com/600x800"} // Fallback image
        alt="Login Banner"
        className="w-full h-full object-cover"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
        {LeftBanner}
        
        {/* Right Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            
            {/* Headers based on step */}
            <h2 className="text-3xl font-bold mb-2">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify & Reset"}
              {step === 3 && "All Done!"}
            </h2>
            
            <p className="text-gray-600 mb-8">
              {step === 1 && "Enter your email to receive a verification code."}
              {step === 2 && "Check your email for the OTP code."}
              {step === 3 && "Your password has been updated."}
            </p>
            
            {/* --- STEP 1: EMAIL FORM --- */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    ref={emailInputRef}
                    autoFocus
                    className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </button>
                  <Link to="/login" className="text-center text-sm text-gray-600 hover:text-black">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* --- STEP 2: OTP & PASSWORD FORM --- */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP Code"
                    required
                    ref={otpInputRef}
                    className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent tracking-widest"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                  />
                </div>

                {/* Confirm Password Input */}
                <div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                    className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  >
                    {isLoading ? "Updating..." : "Reset Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-center text-sm text-gray-600 hover:text-black"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            {/* --- STEP 3: SUCCESS --- */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/login" 
                    className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-center block"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
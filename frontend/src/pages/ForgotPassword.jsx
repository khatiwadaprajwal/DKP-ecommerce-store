import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import api from "../config/api"; 
import { toast } from "react-toastify";

const ForgotPassword = () => {
  // States
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: Success
  const [email, setEmail] = useState("");
  
  // Security Questions State
  const [questions, setQuestions] = useState([]); // Array of { _id, question }
  const [answers, setAnswers] = useState({}); // Object { "questionId": "answer" }

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const emailInputRef = useRef(null);

  // --- HANDLERS ---

  // Step 1: Request Security Questions (Replaces Request OTP)
  const handleGetQuestions = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address");
    
    setIsLoading(true);
    try {
      // Adjusted endpoint to match your routes (Ensure this matches your backend route file)
      const response = await api.post("/v1/get-security-questions", { email });
      
      if (response.status === 200) {
        setQuestions(response.data.questions);
        setStep(2); 
        toast.success("Questions found. Please answer them.");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "User not found or no questions set.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to handle answer input changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Step 2: Verify Answers & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (Object.keys(answers).length !== 3) return toast.error("Please answer all 3 questions");
    if (!password) return toast.error("Enter new password");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    
    setIsLoading(true);
    try {
      // Adjusted endpoint
      const response = await api.put("/v1/auth/reset-password", { 
        email, 
        answers, 
        newPassword: password 
      });
      
      if (response.status === 200) {
        toast.success("Password reset successfully!");
        setStep(3);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to reset password. Check answers.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const LeftBanner = (
    <div className="hidden md:block md:w-1/2 bg-blue-50">
      <img
        src={assets.loginbanner || "https://via.placeholder.com/600x800"} 
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
            
            {/* Headers */}
            <h2 className="text-3xl font-bold mb-2">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Security Questions"}
              {step === 3 && "All Done!"}
            </h2>
            
            <p className="text-gray-600 mb-8">
              {step === 1 && "Enter your email to retrieve your security questions."}
              {step === 2 && "Answer the questions correctly to reset your password."}
              {step === 3 && "Your password has been updated."}
            </p>
            
            {/* --- STEP 1: EMAIL FORM --- */}
            {step === 1 && (
              <form onSubmit={handleGetQuestions} className="space-y-6">
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
                    className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                  >
                    {isLoading ? "Checking..." : "Next"}
                  </button>
                  <Link to="/login" className="text-center text-sm text-gray-600 hover:text-black">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* --- STEP 2: QUESTIONS & PASSWORD FORM --- */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                
                {/* Dynamic Questions Render */}
                {questions.map((q, index) => (
                  <div key={q._id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {index + 1}. {q.question}
                    </label>
                    <input
                      type="text"
                      value={answers[q._id] || ""}
                      onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                      placeholder="Your answer"
                      required
                      className="w-full px-4 py-2 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                    />
                  </div>
                ))}

                <hr className="my-4" />

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

                <div className="flex flex-col space-y-4 mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                  >
                    {isLoading ? "Verifying..." : "Reset Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setQuestions([]); setAnswers({}); }}
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
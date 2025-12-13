import React, { useState, useContext, useEffect } from "react"; // ✅ Added useEffect here
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { toast } from "react-toastify"; // Switched back to toastify based on your previous files
import { Eye, EyeOff } from "lucide-react";
import api from "../config/api";
import { useAuth } from "../context/AuthProvider";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);

  // ✅ Use useAuth instead of ShopContext
  const { login, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Timer Logic for OTP
  useEffect(() => {
    let timer;
    if (showOTP && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOTP, timeLeft]);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) errors.push("Password must be at least 6 characters long");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one capital letter");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Password must contain at least one special character");
    return errors;
  };

  // 1. Handle Registration (Send OTP)
  const handleRegister = async (e) => {
    e.preventDefault();
    
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      passwordErrors.forEach(error => toast.error(error));
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/v1/auth/signup", {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        setShowOTP(true);
        toast.success("Registration successful! Please verify your email with OTP");
      } 
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/v1/auth/verify-otp", {
        email,
        otp,
      });
      
      if (response.status === 200) {
        const { accessToken, user } = response.data;

        // Login via AuthContext
        login(accessToken, user);
        
        toast.success("Email verified successfully!");
        navigate("/");
      } 
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen flex flex-col text-lg">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 bg-blue-50">
          <img
            src={assets.side}
            alt="Register Side"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {!showOTP ? (
              <>
                <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                <p className="text-gray-600 mb-8">Enter your details below</p>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      required
                      className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-3 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Password must be at least 6 characters with one capital letter and one special character
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                      className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-2 top-3 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full px-8 py-3 ${
                        loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                      } text-white rounded-md transition-colors`}
                    >
                      {loading ? "Processing..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
                <p className="text-gray-600 mb-8">
                  Enter the OTP sent to your email
                </p>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      OTP expires in{" "}
                      <span className="text-red-500 font-medium">
                        {formatTime(timeLeft)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading || otp.length < 4}
                      className={`w-full px-8 py-3 ${
                        loading || otp.length < 4
                          ? "bg-gray-400"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white rounded-md transition-colors`}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>

                  {timeLeft <= 0 && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setTimeLeft(600);
                          toast.info("OTP resent to your email");
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}

            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
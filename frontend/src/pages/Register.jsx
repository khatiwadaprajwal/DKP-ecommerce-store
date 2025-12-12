import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { ShopContext } from "../context/ShopContext";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(false);

  const { setToken, token, backend_url } = useContext(ShopContext);
  const navigate = useNavigate();

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one capital letter");
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  // Handle registration submission

const handleRegister = async (e) => {
  e.preventDefault();
  console.log("=== FORM SUBMISSION STARTED ===");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password length:", password.length);
  console.log("Backend URL:", backend_url);
  
  // Validate password
  const passwordErrors = validatePassword(password);
  console.log("Password validation errors:", passwordErrors);
  
  if (passwordErrors.length > 0) {
    console.log("Password validation failed");
    passwordErrors.forEach(error => toast.error(error));
    return;
  }
  
  // Check if passwords match
  if (password !== confirmPassword) {
    console.log("Passwords don't match");
    toast.error("Passwords do not match");
    return;
  }
  
  console.log("Validation passed, starting API call...");
  setLoading(true);

  try {
    console.log("Making POST request to:", `${backend_url}/v1/auth/signup`);
    
    const response = await axios.post(
      `${backend_url}/v1/auth/signup`,
      {
        name,
        email,
        password,
      }
    );
    
    // console.log("API Response:", response);

    if (response.status === 201) {
      console.log("Registration successful!");
      setShowOTP(true);
      toast.success(
        "Registration successful! Please verify your email with OTP"
      );
    } else {
      console.log("Registration failed with status:", response.status);
      toast.error(response.data.message || "Registration failed");
    }
  } catch (error) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error object:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);
    
    toast.error(
      error.response?.data?.message || "An error occurred during registration"
    );
  } finally {
    console.log("Setting loading to false");
    setLoading(false);
  }
};

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${backend_url}/v1/auth/verify-otp`,
        {
          email,
          otp,
        }
      );
      
      if (response.status === 200) {
        navigate("/");
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success("Email verified successfully!");
      } else {
        toast.error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred during OTP verification"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex flex-col text-lg">
      {/* Registration Section */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 bg-blue-50">
          <img
            src={assets.side}
            alt="Shopping Cart with Smartphone"
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
                      id="name"
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
                      id="email"
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
                      id="password"
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
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Password must be at least 6 characters with one capital letter and one special character
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
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
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>

                  <div>
                    <button
  type="submit"
  onClick={() => console.log("Button clicked!")}
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
                          // Add resend OTP logic here
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
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
    </div>
  );
};

export default Register;
import React, { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { toast } from "react-toastify"; 
import { Eye, EyeOff } from "lucide-react";
import api from "../config/api";
import { useAuth } from "../context/AuthProvider";

const Register = () => {
  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Strict Password Validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter required");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter required");
    if (!/\d/.test(password)) errors.push("One number required");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("One special character required");
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Client-side Validation
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
      // 2. API Call (Direct Signup)
      const response = await api.post("/v1/auth/signup", {
        name,
        email,
        password,
      });

      // 3. Success -> Auto Login
      if (response.status === 201) {
        const { accessToken, user } = response.data;
        login(accessToken, user);
        toast.success("Account created successfully!");
        navigate("/"); 
      } 
    } catch (error) {
      console.error("Registration Error:", error);
      const statusCode = error.response?.status;
      const msg = error.response?.data?.message || "Registration failed";

      if (statusCode === 429) {
          toast.error("Too many accounts created from this IP. Please wait.");
      } else {
          toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="flex flex-col min-h-screen text-lg">
      <div className="flex flex-col flex-1 md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden bg-blue-50 md:block md:w-1/2">
          <img
            src={assets.side}
            alt="Register Side"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex items-center justify-center w-full px-6 py-12 md:w-1/2">
          <div className="w-full max-w-md">
            
            <h2 className="mb-2 text-3xl font-bold">Create Account</h2>
            <p className="mb-8 text-gray-600">Enter your details below</p>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Input */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-900 focus:outline-none"
                />
              </div>

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-900 focus:outline-none"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute text-gray-500 right-2 top-3"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, number & special char.
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute text-gray-500 right-2 top-3"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Submit Button */}
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
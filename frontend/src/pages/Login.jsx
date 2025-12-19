import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import loginBannerImg from "../assets/loginBanner.png"; 
import api from "../config/api"; 
import { useAuth } from "../context/AuthProvider"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lock State
  const [lockTimeRemaining, setLockTimeRemaining] = useState(null);
  const [accountLocked, setAccountLocked] = useState(false);

  const navigate = useNavigate();
  const { login, token } = useAuth(); 

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
       navigate('/'); 
    }
  }, [token, navigate]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (lockTimeRemaining && lockTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setAccountLocked(false);
            return null;
          }
          return prev - 1;
        });
      }, 60000); // Decrement every 1 minute
    }
    return () => { if (timer) clearInterval(timer); };
  }, [lockTimeRemaining]);

  // ✅ ADDED: Missing Helper Function
  const formatLockTime = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${rem > 0 ? ` and ${rem} min` : ''}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Backend Route
      const response = await api.post(`/v1/auth/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const { accessToken, user } = response.data;
        login(accessToken, user);
        
        // Reset Lock State on success
        setAccountLocked(false);
        setLockTimeRemaining(null);
        toast.success("Login successful");

        const role = user?.role?.toLowerCase() || "";
        if (role === "admin" || role === "superadmin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      const statusCode = err.response?.status;
      const errorMessage = err.response?.data?.message || "Login failed.";

      // 1. Rate Limiting Handling (429) - From express-rate-limit
      if (statusCode === 429) {
        setError("Too many attempts. Please try again later.");
        toast.error("Too many login attempts from this IP.");
        return;
      }

      // 2. Lockout Handling (403) - From brute force logic
      if (statusCode === 403 && (errorMessage.toLowerCase().includes("locked") || errorMessage.includes("attempts"))) {
        setAccountLocked(true);
        setError(""); 

        // Extract time from string like "Account locked. Try again in 15 minutes"
        const minutesMatch = errorMessage.match(/(\d+) minute/);
        if (minutesMatch) {
          setLockTimeRemaining(parseInt(minutesMatch[1]));
        } else {
          setLockTimeRemaining(15); // Default fallback
        }
      } else {
        // 3. Normal error (400/401)
        setAccountLocked(false);
        setError(errorMessage); 
        if (statusCode !== 401) toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-lg">
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* IMAGE SECTION */}
        <div className="hidden md:block md:w-1/2 bg-blue-50">
          <img 
            src={loginBannerImg} 
            alt="Login Banner" 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* FORM SECTION */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold mb-2">Log in to Dkp</h2>
            <p className="text-gray-600 mb-8">Enter your details below</p>

            {/* Box 1: Generic Error */}
            {error && !accountLocked && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded text-sm font-medium">
                {error}
              </div>
            )}

            {/* Box 2: Account Locked Specific */}
            {accountLocked && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded border border-red-200">
                <p className="font-bold">Account Locked</p>
                <p className="text-sm">
                   {/* This line will now work correctly */}
                   Try again in {lockTimeRemaining ? formatLockTime(lockTimeRemaining) : 'a few minutes'}.
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email" 
                required 
                disabled={accountLocked || isLoading}
                className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
              />
              
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                required 
                disabled={accountLocked || isLoading}
                className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
              />

              <div className="flex justify-between items-center">
                <button 
                  type="submit" 
                  disabled={isLoading || accountLocked} 
                  className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Logging in..." : accountLocked ? "Locked" : "Log in"}
                </button>
                <Link to="/forgot-password" className="text-red-500 hover:underline text-sm">Forgot Password?</Link>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
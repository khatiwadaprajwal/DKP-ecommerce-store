import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import {toast} from "react-hot-toast";
import { ShopContext } from "../context/ShopContext";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../component/ProtectedRoutes";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(null);
  const [accountLocked, setAccountLocked] = useState(false);
  
  const navigate = useNavigate();
  const { setToken } = useContext(ShopContext);
  const { setUser } = useAuth();

  // Handle countdown timer for locked accounts
  useEffect(() => {
    let timer;
    if (lockTimeRemaining && lockTimeRemaining > 0) {
      timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setAccountLocked(false);
            return null;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockTimeRemaining]);

  const formatLockTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` : ''}`;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/v1/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        // Reset login attempts on successful login
        setLoginAttempts(0);
        setAccountLocked(false);
        setLockTimeRemaining(null);
        
        // Store token
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);

        // Decode token to get role
        const decoded = jwtDecode(response.data.token);
        localStorage.setItem("user", JSON.stringify(decoded));
        
        // Redirect based on role
        setUser(decoded);
        if (decoded.role === "Admin" || decoded.role === "SuperAdmin") {
          navigate("/admin");
        } else if (decoded.role === "Customer") {
          navigate("/");
        } else {
          navigate("/login");
        }
        toast.success("Login successful");
      }
    } catch (err) {
      const statusCode = err.response?.status;
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      
      if (statusCode === 403 && errorMessage.includes("Account locked")) {
        // Handle locked account
        setAccountLocked(true);
        
        // Extract minutes from error message if available
        const minutesMatch = errorMessage.match(/(\d+) minute/);
        if (minutesMatch) {
          const minutes = parseInt(minutesMatch[1], 10);
          setLockTimeRemaining(minutes);
        } else if (errorMessage.includes("1 hour")) {
          setLockTimeRemaining(60); // 60 minutes for 1 hour
        }
      } else if (statusCode === 401) {
        // Track failed attempts on the frontend
        setLoginAttempts(prev => prev + 1);
        
        // Warn user about remaining attempts
        const remainingAttempts = 10 - (loginAttempts + 1);
        if (remainingAttempts <= 3 && remainingAttempts > 0) {
          setError(`${errorMessage}. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lock.`);
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-lg">
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 bg-blue-50">
          <img
            src={assets.banner}
            alt="Shopping Cart"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2">Log in to Dkp</h1>
            <p className="text-gray-600 mb-8">Enter your details below</p>

            {error && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            {accountLocked && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded border border-red-200">
                <p className="font-medium">Account temporarily locked</p>
                {lockTimeRemaining ? (
                  <p>Please try again in {formatLockTime(lockTimeRemaining)}</p>
                ) : (
                  <p>Please try again later</p>
                )}
              </div>
            )}

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
                  disabled={accountLocked}
                  className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
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
                  disabled={accountLocked}
                  className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoading || accountLocked}
                  className={`px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors ${
                    isLoading || accountLocked ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Logging in..." : accountLocked ? "Account Locked" : "Log in"}
                </button>
                <Link
                  to="/forgot-password"
                  className="text-red-500 hover:underline"
                >
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
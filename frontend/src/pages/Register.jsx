import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(false);

  const { setToken, token, backend_url } = useContext(ShopContext);
  const navigate = useNavigate();

  // Handle registration submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/v1/auth/signup",
        {
          name,
          email,
          password,
        }
      );
      console.log(response);

      if (response.status === 201) {
        setShowOTP(true);
        toast.success(
          "Registration successful! Please verify your email with OTP"
        );
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/v1/auth/verify-otp",
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

  return (
    <div className="min-h-screen flex flex-col text-lg">
      {/* Top Banner (commented out for consistency with login page) */}
      {/* <div className="bg-black text-white py-2 px-4 text-center text-sm">
        Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{" "}
        <span className="font-semibold">ShopNow</span>
      </div> */}

      {/* Registration Section */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 bg-blue-50">
          <img
            src={assets.banner}
            alt="Shopping Cart with Smartphone"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {!showOTP ? (
              <>
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
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
    </div>
  );
};

export default Register;

import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import toast from "toastify";
import { ShopContext } from "../context/Shopcontext";
import {useNavigate} from 'react-router'

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [otpSent, setOtpSent] = useState(false);
  

  
  const {token, setToken, backend_url}=useContext(ShopContext)
  const navigate =useNavigate();

  const handleRegister = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(backend_url + "/signup", {
        name,
        email,
        password,
      });
      if (response.data.success) {
        setShowOTP(true);
        setOtpSent(true);
        const response1 = await axios.post(backend_url + "/verify-otp", {
          email,
          otp,
        });
        if (response1.data.success) {
          setToken(response1.data.token);
          localStorage.setItem("token", response1.data.token);
        } else {
          toast.error(response1.message);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  };

  // Start countdown when OTP is shown
  useEffect(() => {
    if (!showOTP) return;

    if (timeLeft <= 0) return; // Stop when timer reaches 0

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [showOTP, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(()=>{
    if(token){
      navigate('/')
    }
  })

  return (
    <section className="h-screen flex items-center justify-center">
      <div className="max-w-lg min-h-96 rounded shadow-lg bg-gray-200 mx-auto p-10">
        {!showOTP ? (
          <>
            <p className="text-3xl font-semibold  text-center items-center justify-center">
              Sign Up
            </p>
            <form
              onSubmit={handleRegister}
              className="space-y-5 max-w-sm mx-auto pt-8"
            >
              <input
                type="name"
                name="name"
                id="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Full Name"
                required
                className="w-full bg-gray-300  rounded shadow focus:outline-none px-5 py-3"
              />
              <input
                type="email"
                name="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email Address"
                required
                className="w-full bg-gray-300  rounded shadow focus:outline-none px-5 py-3"
              />
              <input
                type="password"
                name="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Password"
                required
                className="w-full bg-gray-300 rounded focus:outline-none px-5 py-3"
              />

              <button
                type="submit"
                className="w-full mt-5 bg-red-500 text-white hover:bg-black font-medium py-2 rounded text-bold"
              >
                Register
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold  text-center items-center justify-center">
              Verify OPT
            </p>

            <div className="text-center py-8 px-14">
              <input
                type="number"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full bg-gray-100 rounded-md px-4 py-3 focus:outline-none appearance-none otp-inpu"
                style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              />
              <p className="mt-2 text-gray-600 font-semibold">
                OTP expires in{" "}
                <span className="text-red-500">{formatTime(timeLeft)}</span>
              </p>
              <button className="w-full mt-4 bg-green-600 text-white text-center justify-center items-center font-bold py-3 rounded-md hover:bg-green-700">
                Verify OTP
              </button>
            </div>
          </>
        )}

        <p className="my-4 text-base text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-bold">
            Login{" "}
          </Link>
          here
        </p>
      </div>
    </section>
  );
};

export default Register;

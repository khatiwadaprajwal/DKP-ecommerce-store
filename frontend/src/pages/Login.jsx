import React, { useState }  from "react";
import { Link } from "react-router-dom";

const Login = () => {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = {
      email,
      password,
    };
    console.log(data);
  };
  return (
    <section className="h-screen flex items-center justify-center">
      <div className="max-w-lg min-h-96 rounded shadow-lg bg-gray-200 mx-auto p-10">
        <p className="text-3xl font-semibold  text-center items-center justify-center">
          Sign In
        </p>
        <form
          onSubmit={handleLogin}
          className="space-y-5 max-w-sm mx-auto pt-8"
        >
          <input
            type="email"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full bg-gray-300  rounded shadow focus:outline-none px-5 py-3"
          />
          <input
            type="password"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-gray-300 rounded focus:outline-none px-5 py-3"
          />
          <button
            type="submit"
            className="w-full mt-5 bg-red-500 text-white hover:bg-black font-medium py-3 rounded text-bold"
          >
            Login
          </button>
        </form>

        <p className="my-5 text-base text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-bold">
            Register{" "}
          </Link>
          here
        </p>
      </div>
    </section>
  );
};

export default Login;

"use client";
import React, { useState } from "react";
import { TailSpin } from 'react-loader-spinner';
import { FaUserCircle } from "react-icons/fa";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (mode === "login") {
        if (email === "user@example.com" && password === "password") {
          alert("Login successful!");
        } else {
          setError("Invalid email or password");
        }
      } else if (mode === "signup") {
        alert("Sign up successful! Please check your email for verification.");
      } else if (mode === "forgot") {
        alert("Password reset link sent to your email.");
      }
      setLoading(false);
    }, 1000);
  };
  const handleReset = () => {
    setEmail("");
    setPassword("");
    setError("");
  };
  const renderForm = () => {
    if (mode === "login") {
      return (
        <>
          <div className="relative w-full flex justify-center">
            <div className="absolute -top-36"> {/* Move circle icon more upwards */}
              <div className="bg-white rounded-full p-2 shadow-lg">
                <FaUserCircle className="text-9xl text-cyan-500" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 pt-6">Login</h2>
          <div className="mb-6">
            <label className="block text-black font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-gray-800 bg-white border-b-2 border-cyan-500 outline-none focus:border-cyan-700 transition-all"
              required />
          </div>
          <div className="mb-6">
            <label className="block text-black font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-gray-800 bg-white border-b-2 border-cyan-500 outline-none focus:border-cyan-700 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-3/4 mx-auto block p-3 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-all ${loading && "cursor-not-allowed"}`}
            disabled={loading}>
            {loading ? (
              <TailSpin height="25" width="25" color="#fff" ariaLabel="loading" />
            ) : (
              "Login"
            )}
          </button>
          <p className="text-center text-black mt-6">
            <button onClick={() => setMode("forgot")} className="hover:underline">Forgot Password?</button>
          </p>
          <p className="text-center text-black mt-6">
            Don't have an account?{" "}
            <button onClick={() => setMode("signup")} className="hover:underline">Sign Up</button>
          </p>
        </>
      );
    } else if (mode === "signup") {
      return (
        <>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
          <div className="mb-6">
            <label className="block text-black font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-gray-800 bg-white border-b-2 border-cyan-500 outline-none focus:border-cyan-700 transition-all"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-black font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-gray-800 bg-white border-b-2 border-cyan-500 outline-none focus:border-cyan-700 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-3/4 mx-auto block p-3 bg-cyan-600 text-black rounded hover:bg-cyan-500 transition-all ${loading && "cursor-not-allowed"}`}
            disabled={loading}>
            {loading ? (
              <TailSpin height="25" width="25" color="#fff" ariaLabel="loading" />
            ) : (
              "Sign Up"
            )}
          </button>
          <p className="text-center text-black mt-6">
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="hover:underline">Login</button>
          </p>
        </>
      );
    } else if (mode === "forgot") {
      return (
        <>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
          <div className="mb-6">
            <label className="block text-black font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-gray-800 bg-white border-b-2 border-cyan-500 outline-none focus:border-cyan-700 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-3/4 mx-auto block p-3 bg-cyan-600 text-black rounded hover:bg-cyan-500 transition-all ${loading && "cursor-not-allowed"}`}
            disabled={loading}>
            {loading ? (
              <TailSpin height="25" width="25" color="#fff" ariaLabel="loading" />
            ) : (
              "Reset Password"
            )}
          </button>
        </>
      );
    }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900" style={{ backgroundImage: 'url(/image/bg1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <form
        className="relative w-full max-w-lg bg-white shadow-2xl rounded-lg p-8"
        onSubmit={handleAuth}>
        {renderForm()}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
};
export default Login;
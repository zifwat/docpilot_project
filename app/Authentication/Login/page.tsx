"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { TailSpin } from "react-loader-spinner";
import { FaUserCircle, FaFacebook, FaGithub, FaMicrosoft } from "react-icons/fa";

const LoginPage: React.FC = () => {
  const router = useRouter(); // Initialize useRouter
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Simulate an API call or validation
    setTimeout(() => {
      if (email === "nurulmahirah14@gmail.com" && password === "123") { // Hardcoded credentials
        alert("Login successful!");
        router.push("/Homepage/Dashboard"); // Redirect to the Dashboard page
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="h-full flex items-center justify-center bg-gray-900"
      style={{
        backgroundImage: 'url(/image/bg1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <form
        className="relative w-full max-w-lg bg-white shadow-2xl rounded-lg p-8"
        onSubmit={handleLogin}
      >
        <div className="relative w-full flex justify-center">
          <div className="absolute -top-36">
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
          className={`w-3/4 mx-auto block p-3 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-all ${loading && "cursor-not-allowed"}`}
          disabled={loading}
        >
          {loading ? (
            <TailSpin height="25" width="25" color="#fff" ariaLabel="loading" />
          ) : (
            "Login"
          )}
        </button>
        <p className="text-center text-black mt-6">
          <a href="/forgetpass" className="hover:underline">Forgot Password?</a>
        </p>
        <p className="text-center text-black mt-6">
          Don't have an account?{" "}
          <a href="/Authentication/SignUp" className="hover:underline">Sign Up</a>
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <button className="bg-gray-800 p-3 text-white rounded-full">
            <FaGithub size={20} />
          </button>
          <button className="bg-blue-600 p-3 text-white rounded-full">
            <FaFacebook size={20} />
          </button>
          <button className="bg-blue-600 p-3 text-white rounded-full">
            <FaMicrosoft size={20} />
          </button>
        </div>
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;

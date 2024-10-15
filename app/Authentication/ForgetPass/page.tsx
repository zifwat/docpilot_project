"use client";
import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { AiOutlineClose } from "react-icons/ai";

const ForgetPassPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Password reset link sent to your email.");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900" style={{ backgroundImage: 'url(/image/bg1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <form
        className="relative w-full max-w-lg bg-white shadow-2xl rounded-lg p-8"
        onSubmit={handlePasswordReset}
      >
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
          <a href="/login">
            <AiOutlineClose size={24} className="text-gray-800 hover:text-gray-500" />
          </a>
        </div>
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
          className={`w-3/4 mx-auto block p-3 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-all ${loading && "cursor-not-allowed"}`}
          disabled={loading}
        >
          {loading ? (
            <TailSpin height="25" width="25" color="#fff" ariaLabel="loading" />
          ) : (
            "Reset Password"
          )}
        </button>
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default ForgetPassPage;

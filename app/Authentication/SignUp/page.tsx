"use client";
import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { FaGithub, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import axios from 'axios';
import { useRouter } from 'next/navigation'; 

const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const router = useRouter(); 

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post('http://localhost:3002/api/auth/signup', { email, password });
            alert("Sign up successful! Please check your email for verification.");
            // Redirect to login page after successful signup
            router.push('/Authentication/Login');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'An error occurred during sign up.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex items-center justify-center bg-gray-900" 
             style={{ backgroundImage: 'url(/image/bg1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <form
                className="relative w-full max-w-lg bg-white shadow-2xl rounded-lg p-8"
                onSubmit={handleSignUp}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
                    <button type="button" onClick={() => router.push('/Authentication/Login')}>
                        <AiOutlineClose size={24} className="text-gray-800 hover:text-gray-500" />
                    </button>
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
                        "Sign Up"
                    )}
                </button>
                {error && <p className="text-red-600 text-center mt-4">{error}</p>}
                <p className="text-center text-black mt-6">
                    Already have an account?{" "}
                    <a href="/Authentication/Login" className="hover:underline">Login</a>
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
            </form>
        </div>
    );
};

export default SignUpPage;

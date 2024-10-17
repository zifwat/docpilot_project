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
    const [showModal, setShowModal] = useState<boolean>(false); // Modal state

    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:3002/api/user/signup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);

            // Show success modal on successful signup
            setShowModal(true);
        } catch (err: any) {
            setError(err.message);
            setLoading(false); // Stop loading when error occurs
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        router.push('/Authentication/Login'); // Redirect to login page after closing modal
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

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-1/3 text-center shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign Up Successful!</h2>
                        <p className="text-gray-600 mb-6">You have successfully signed up. Welcome aboard!</p>
                        <button
                            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-500 transition-all"
                            onClick={handleCloseModal}
                        >
                            Continue to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignUpPage;

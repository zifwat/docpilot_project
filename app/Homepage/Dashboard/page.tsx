"use client";

// src/Dashboard.js
import React from 'react';
import Link from 'next/link';
import { FaFileAlt, FaGraduationCap } from 'react-icons/fa';

const Dashboard = () => {
    return (
        <div className="flex bg-gray-900 text-gray-200 h-[90.2vh] items-center justify-center">

            {/* Action Buttons Section */}
            <div className="w-3/4 p-16 flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-10 text-center">Dashboard</h1>
                
                <div className="flex flex-col items-center space-y-8 w-full">
                    {/* Extraction Button */}
                    <Link
                        href="/Homepage/Extraction"
                        className="bg-blue-600 text-gray-200 p-8 w-3/4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 flex flex-col items-center"
                    >
                        <FaFileAlt className="text-5xl mb-2" />
                        <span className="text-2xl">Extraction</span>
                    </Link>

                    {/* Training Button */}
                    <Link
                        href="/Homepage/Training"
                        className="bg-green-600 text-gray-200 p-8 w-3/4 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 flex flex-col items-center"
                    >
                        <FaGraduationCap className="text-5xl mb-2" />
                        <span className="text-2xl">Training</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

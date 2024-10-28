import React from 'react';
import Link from 'next/link';
import { FaFileAlt, FaGraduationCap } from 'react-icons/fa';
import Bg from "@/img/bg3.jpg"; // Ensure this path is correct

const Dashboard = () => {
    return (
        <div
            className="bg-cover bg-center h-full flex items-center justify-center"
            style={{ backgroundImage: `url(${Bg.src})` }}
        >
            <div className="bg-white bg-opacity-80 h-full w-full justify-center p-10 rounded-lg shadow-lg flex flex-col items-center space-y-20">
                <h1 className="text-5xl text-gray-900 font-bold text-center">
                    WELCOME TO DOCPILOT
                </h1>

                {/* Button Container */}
                <div className="flex flex-row space-x-10">
                    {/* Extraction Button */}
                    <div className="flex flex-col items-center">
                        <Link href="/Homepage/Extraction" aria-label="Go to Extraction page" className="w-auto">
                            <div className="bg-teal-800 rounded-2xl shadow-sm shadow-teal-500 outline outline-slate-400 -outline-offset-8">
                                <div className="group relative overflow-hidden duration-500 hover:rotate-12 flex justify-center items-center h-56 w-80 bg-white rounded-2xl outline outline-neutral-900 -outline-offset-8 cursor-pointer">
                                    <div className="absolute w-20 h-20 bg-teal-800 rounded-full blur-xl bottom-32 right-16 duration-500 group-hover:translate-x-24" />
                                    <div className="absolute w-12 h-12 bg-teal-400 rounded-full blur-xl top-20 right-16 duration-500 group-hover:translate-y-12 group-hover:-translate-x-32" />
                                    <div className="z-10 flex flex-col items-center gap-2">
                                        <FaFileAlt className="text-4xl mb-2 text-black" />
                                        <span className="text-black text-3xl font-bold">Extraction</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <div className="mt-2 bg-teal-700 rounded-full px-4 py-2 text-center text-white">
                            This feature allows you to extract data from various sources.
                        </div>
                    </div>

                    {/* Training Button */}
                    <div className="flex flex-col items-center">
                        <Link href="/Homepage/Training" aria-label="Go to Training page" className="w-auto">
                            <div className="bg-teal-800 rounded-2xl shadow-sm shadow-teal-500 outline outline-slate-400 -outline-offset-8">
                                <div className="group relative overflow-hidden duration-500 hover:rotate-12 flex justify-center items-center h-56 w-80 bg-white rounded-2xl outline outline-neutral-900 -outline-offset-8 cursor-pointer">
                                    <div className="absolute w-20 h-20 bg-teal-800 rounded-full blur-xl bottom-32 right-16 duration-500 group-hover:translate-x-24" />
                                    <div className="absolute w-12 h-12 bg-teal-400 rounded-full blur-xl top-20 right-16 duration-500 group-hover:translate-y-12 group-hover:-translate-x-32" />
                                    <div className="z-10 flex flex-col items-center gap-2">
                                        <FaGraduationCap className="text-4xl mb-2 text-black" />
                                        <span className="text-black text-3xl font-bold">Training</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <div className="mt-2 bg-teal-700 rounded-full px-4 py-2 text-center text-white">
                            This section provides training resources and tutorials.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
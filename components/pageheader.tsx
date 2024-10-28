"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/logo/logodocpilot5.png';
import { useRouter } from 'next/navigation';

// Logout Modal Component
const LogoutModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-96">
                <h2 className="text-2xl text-teal-500 font-bold mb-4">Are you sure?</h2>
                <p className="text-gray-700 mb-6">Do you really want to log out?</p>
                <div className="flex justify-between">
                    <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-teal-600"
                        onClick={onConfirm}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

// Header Component
const Header: React.FC = () => {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);

    const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        localStorage.removeItem('userToken');
        router.push('/');
    };

    return (
        <>
            <header className=" bg-gradient-to-r from-[#125564] to-[#46dfde] shadow-lg border-b-2">
                <div className="p-5 flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex">
                            <Image src={Logo} alt="DocPilot Logo" width={150} />
                        </Link>
                    </div>
                    <nav className="flex space-x-10">
                        <Link href="/Homepage/Dashboard" className="hover:text-coral-400">
                            <span className="font-semibold text-lg">Home</span>
                        </Link>
                        <Link href="/Homepage/Extraction" className="hover:text-coral-400">
                            <span className="font-semibold text-lg">Extraction</span>
                        </Link>
                        <Link href="/Homepage/Training" className="hover:text-coral-400">
                            <span className="font-semibold text-lg">Training</span>
                        </Link>
                        <a href="/" onClick={handleLogoutClick} className="hover:text-coral-400">
                            <span className="font-semibold text-lg">Log Out</span>
                        </a>
                    </nav>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            <LogoutModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                onConfirm={handleLogoutConfirm} 
            />
        </>
    );
};

export default Header;
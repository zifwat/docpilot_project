"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/logo/logodocpilot5.png';
import { useRouter } from 'next/navigation';

// Logout Modal Component
const LogoutModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null; // Don't render the modal if it's not open

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-6 w-2/5">
                <h2 className="text-lg text-black font-bold mb-2">Confirm Logout</h2>
                <p className="text-black mb-4">Are you sure you want to log out?</p>
                <div className="flex justify-end gap-4">
                    <button
                        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-900"
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
    const [isModalOpen, setModalOpen] = useState(false); // State to manage modal visibility

    const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault(); // Prevent the default link behavior
        setModalOpen(true); // Open the confirmation modal
    };

    const handleLogoutConfirm = () => {
        // Clear user session or token here (if using context or local storage)
        localStorage.removeItem('userToken'); // Example for clearing local storage
        // Redirect to the landing page
        router.push('/');
    };

    return (
        <>
            <header className="bg-gradient-to-r from-red-800 from-20% via-cyan-400 via-40% to-cyan-500 to-90% text-black p-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center">
                    <Link href="/" className="flex">
                        <Image src={Logo} alt="DocPilot Logo" width={250} />
                    </Link>
                </div>
                <nav className="flex space-x-10">
                    <Link href="/Homepage/Dashboard" className="hover:text-white text-black font-semibold">
                        Home
                    </Link>
                    <Link href="/Homepage/Extraction" className="hover:text-white text-black font-semibold">
                        Extraction
                    </Link>
                    <Link href="/Homepage/Training" className="hover:text-white text-black font-semibold">
                        Training
                    </Link>
                    {/* Use a link for Log Out with a click handler */}
                    <a href="/" onClick={handleLogoutClick} className="hover:text-white text-black font-semibold">
                        Log Out
                    </a>
                </nav>
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

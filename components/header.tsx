import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/logo/iai-logo-black.png';

const Header: React.FC = () => {
  return (
    <header className="bg-cyan-950 text-white p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center">
        <Link className='flex' href="/">
        <Image src={Logo} alt='altlogo' width={180}/>
        </Link>
      </div>
      <nav className="flex space-x-10">
        <a href="#" className="hover:text-red-300 text-white  font-semibold">Tools</a>
        <a href="#" className="hover:text-red-300 text-white font-semibold">Help</a>
        <a href="#" className="hover:text-red-300 text-white  font-semibold">Sign Up</a>
        <a href="#" className="hover:text-red-300 text-white  font-semibold">Login</a>
      </nav>
    </header>
  );
};

export default Header;

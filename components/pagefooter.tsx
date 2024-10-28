import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/logo/iai-logo-black.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#e3eced] via-[#e3eced] to-[#125564] shadow-lg border-b-2">
      <div className="flex items-center justify-center">
        <p className='px-3 text-black text-sm font-semibold'>Property of</p>
        <Link className='flex' href="/">
          <Image src={Logo} alt='altlogo ' className='items-center' width={100} />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;

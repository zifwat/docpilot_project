import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/logo/iai-logo-black.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cyan-950 p-4 flex items-center justify-center sticky bottom-0 z-30">
      <div className="flex items-center justify-center">
        <Link className='flex' href="/">
        <Image src={Logo} alt='altlogo' width={200}/>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;

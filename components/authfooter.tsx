import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/logo/iai-logo-black.png';

const authfooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-transparent via-transparent to-[#125564] shadow-lg ">
      <div className="flex items-center justify-center">
        <p className='px-3 text-black text-sm font-semibold pb-4 '>Property of</p>
        <Link className='flex' href="/">
          <Image src={Logo} alt='altlogo ' className='pb-4 items-center' width={120} />
        </Link>
      </div>
    </footer>
  );
};

export default authfooter;

import React from 'react'
import AuthHeader from '@/components/authheader';
import AuthFooter from '@/components/authfooter';
import Contact from '@/components/contact';
import Feature from '@/components/feature';

const Home = () => {
  return (
    <main>
      <AuthHeader />
      <Feature />
      <Contact />
      <AuthFooter />
    </main>
  )
}

export default Home;
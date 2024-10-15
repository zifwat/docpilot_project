import React from 'react';
import AuthHeader from '@/components/authheader'
import AuthFooter from '@/components/authfooter'

interface Props {
    children: React.ReactNode;
}

const AuthenticationLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className='h-screen'>

            <AuthHeader />
            {children}
            <AuthFooter />

        </div>
    );
};

export default AuthenticationLayout;

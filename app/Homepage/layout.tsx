// components/DashboardLayout.tsx
import React from 'react';
import PageHeader from "@/components/pageheader";
import AuthFooter from '@/components/authfooter'

interface Props {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen">
            <PageHeader />
            <div className="flex-grow bg-transparent">{children}</div>
            <AuthFooter/>
        </div>
    );
};

export default DashboardLayout;

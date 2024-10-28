// components/DashboardLayout.tsx
import React from 'react';
import PageHeader from "@/components/pageheader";
import AuthFooter from '@/components/authfooter';

interface Props {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen bg-[#e3eced]">
            {/* Page Header */}
            <PageHeader />

            {/* Main Content Area */}
            <main className="flex-grow m-2">{children}</main>

            {/* Footer */}
            <AuthFooter />
        </div>
    );
};

export default DashboardLayout;